import { Router } from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Invoice from "../models/Invoice.js";
import Patient from "../models/Patient.js";
import Item from "../models/Item.js";
import Payroll from "../models/Payroll.js";
import Staff from "../models/Staff.js";
import Site from "../models/Site.js";
import { protect, allow, can, staffOnly } from "../middleware/auth.js";
import { doctorScope } from "./appointments.js";
import { addDays, eachDay, endOfDayPH, startOfDayPH, todayPH } from "../utils/dates.js";

const r = Router();
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const fill = (days, rows, key = "count") => days.map((d) => ({ date: d, value: rows.find((x) => x._id === d)?.[key] || 0 }));

// Reports & analytics: volume, revenue, popular services, stock and payroll in a date range.
r.get("/summary", protect, allow("reports"), async (req, res) => {
  const today = todayPH();
  const to = ISO.test(req.query.to || "") ? req.query.to : today;
  let from = ISO.test(req.query.from || "") ? req.query.from : addDays(to, -29);
  if (from > to) from = to;
  if (from < addDays(to, -365)) from = addDays(to, -365);
  const days = eachDay(from, to);
  const [gte, lte] = [startOfDayPH(from), endOfDayPH(to)];
  const apptMatch = { date: { $gte: from, $lte: to } };
  const fmt = { $dateToString: { format: "%Y-%m-%d", date: "$payments.date", timezone: "Asia/Manila" } };

  const [volume, status, specialties, topDoctors, revenueDays, byMethod, outstanding, services, newPatients, lowStock, expiring, payrollPaid, site] = await Promise.all([
    Appointment.aggregate([{ $match: { ...apptMatch, status: { $ne: "Cancelled" } } }, { $group: { _id: "$date", count: { $sum: 1 } } }]),
    Appointment.aggregate([{ $match: apptMatch }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Appointment.aggregate([
      { $match: { ...apptMatch, status: { $ne: "Cancelled" } } },
      { $lookup: { from: "doctors", localField: "doctor", foreignField: "_id", as: "d" } }, { $unwind: "$d" },
      { $group: { _id: "$d.specialty", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 },
    ]),
    Appointment.aggregate([
      { $match: { ...apptMatch, status: { $ne: "Cancelled" } } },
      { $group: { _id: "$doctor", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 },
      { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "d" } }, { $unwind: "$d" },
      { $project: { name: "$d.name", count: 1 } },
    ]),
    Invoice.aggregate([{ $match: { status: { $ne: "Void" } } }, { $unwind: "$payments" }, { $match: { "payments.date": { $gte: gte, $lte: lte } } }, { $group: { _id: fmt, total: { $sum: "$payments.amount" } } }]),
    Invoice.aggregate([{ $match: { status: { $ne: "Void" } } }, { $unwind: "$payments" }, { $match: { "payments.date": { $gte: gte, $lte: lte } } }, { $group: { _id: "$payments.method", total: { $sum: "$payments.amount" } } }, { $sort: { total: -1 } }]),
    Invoice.aggregate([{ $match: { status: { $in: ["Unpaid", "Partial"] } } }, { $group: { _id: null, total: { $sum: "$balance" }, count: { $sum: 1 } } }]),
    Invoice.aggregate([
      { $match: { status: { $ne: "Void" }, createdAt: { $gte: gte, $lte: lte } } }, { $unwind: "$items" },
      { $group: { _id: "$items.description", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.qty", "$items.unitPrice"] } } } },
      { $sort: { revenue: -1 } }, { $limit: 8 },
    ]),
    Patient.countDocuments({ createdAt: { $gte: gte, $lte: lte } }),
    Item.countDocuments({ $expr: { $lte: ["$qty", "$reorderLevel"] } }),
    Item.countDocuments({ expiry: { $ne: "", $lte: addDays(today, 60) } }),
    Payroll.aggregate([{ $match: { status: "Paid", paidAt: { $gte: gte, $lte: lte } } }, { $group: { _id: null, total: { $sum: "$net" } } }]),
    Site.get(),
  ]);

  const specName = (id) => site.specialties.find((s) => s.id === id)?.name || id;
  const revenueSeries = fill(days, revenueDays, "total");
  res.json({
    range: { from, to },
    totals: {
      appointments: volume.reduce((s, x) => s + x.count, 0),
      newPatients,
      revenue: revenueSeries.reduce((s, x) => s + x.value, 0),
      outstanding: outstanding[0]?.total || 0,
      unpaidInvoices: outstanding[0]?.count || 0,
      lowStock, expiring,
      payrollPaid: payrollPaid[0]?.total || 0,
      activeStaff: await Staff.countDocuments({ active: true }),
    },
    patientVolume: fill(days, volume),
    revenueByDay: revenueSeries,
    status: status.map((s) => ({ label: s._id, value: s.count })),
    popularSpecialties: specialties.map((s) => ({ label: specName(s._id), value: s.count })),
    topDoctors: topDoctors.map((d) => ({ label: d.name, value: d.count })),
    popularServices: services.map((s) => ({ label: s._id, value: s.revenue, qty: s.qty })),
    revenueByMethod: byMethod.map((m) => ({ label: m._id, value: m.total })),
  });
});

// Landing numbers for the staff dashboard. Only returns what the user's permissions allow.
r.get("/overview", protect, staffOnly, async (req, res) => {
  const out = {};
  const today = todayPH();
  if (can(req.user, "appointments")) {
    const scope = await doctorScope(req.user);
    out.appointmentsToday = await Appointment.countDocuments({ ...scope, date: today, active: true });
    out.upcoming = await Appointment.find({ ...scope, date: { $gte: today }, active: true }).sort("date time").limit(6).populate("doctor", "name");
  }
  if (can(req.user, "emr")) out.patients = await Patient.countDocuments();
  if (can(req.user, "billing")) {
    out.unpaidInvoices = await Invoice.countDocuments({ status: { $in: ["Unpaid", "Partial"] } });
    const rev = await Invoice.aggregate([{ $unwind: "$payments" }, { $match: { status: { $ne: "Void" }, "payments.date": { $gte: startOfDayPH(today), $lte: endOfDayPH(today) } } }, { $group: { _id: null, total: { $sum: "$payments.amount" } } }]);
    out.revenueToday = rev[0]?.total || 0;
  }
  if (can(req.user, "inventory")) out.lowStock = await Item.countDocuments({ $expr: { $lte: ["$qty", "$reorderLevel"] } });
  if (can(req.user, "staff")) out.activeStaff = await Staff.countDocuments({ active: true });
  res.json(out);
});

export default r;
