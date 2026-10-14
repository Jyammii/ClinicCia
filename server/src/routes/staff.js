import { Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import Shift from "../models/Shift.js";
import Payroll from "../models/Payroll.js";
import { crud } from "../middleware/crud.js";
import { protect, allow } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { computePay } from "../utils/payroll.js";

const r = Router();

// ---- Employees -------------------------------------------------------------
r.use("/staff", crud(Staff, {
  read: ["staff"], write: ["staff"],
  fields: ["name", "position", "department", "phone", "email", "dailyRate", "allowance", "hireDate", "active"],
  search: ["name", "position", "employeeNo", "department"],
  sort: "name",
}));

// ---- Shifts / duty roster --------------------------------------------------
r.use("/shifts", crud(Shift, {
  read: ["staff"], write: ["staff"],
  fields: ["staff", "date", "type", "start", "end", "status", "notes"],
  populate: { path: "staff", select: "name position" },
  sort: "date start",
  filter: (req) => {
    const f = {};
    const { from, to } = req.query;
    if (/^\d{4}-\d{2}-\d{2}$/.test(from || "")) f.date = { $gte: from };
    if (/^\d{4}-\d{2}-\d{2}$/.test(to || "")) f.date = { ...f.date, $lte: to };
    if (mongoose.isValidObjectId(req.query.staff)) f.staff = req.query.staff;
    return f;
  },
}));

// ---- Payroll ---------------------------------------------------------------
const pr = Router();
pr.use(protect, allow("staff"));
pr.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));
const POP = { path: "staff", select: "name position employeeNo" };

pr.get("/", async (req, res) => {
  const f = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.from || "")) f.periodStart = { $gte: req.query.from };
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.to || "")) f.periodEnd = { $lte: req.query.to };
  res.json(await Payroll.find(f).sort("-periodEnd").limit(500).populate(POP));
});

// Creates a draft payslip for every active employee. Days worked come from the duty roster
// (Present or Scheduled shifts) and can be corrected afterwards.
pr.post(
  "/generate",
  [
    body("periodStart").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Enter a valid start date."),
    body("periodEnd").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Enter a valid end date."),
    body("periodEnd").custom((v, { req }) => v >= req.body.periodStart).withMessage("End date must be on or after the start date."),
  ],
  validate,
  async (req, res) => {
    const { periodStart, periodEnd } = req.body;
    const staff = await Staff.find({ active: true });
    let created = 0;
    for (const s of staff) {
      if (await Payroll.exists({ staff: s._id, periodStart, periodEnd })) continue;
      const daysWorked = await Shift.countDocuments({ staff: s._id, date: { $gte: periodStart, $lte: periodEnd }, status: { $in: ["Present", "Scheduled"] } });
      const input = { dailyRate: s.dailyRate, daysWorked, allowances: s.allowance || 0 };
      await Payroll.create({ staff: s._id, periodStart, periodEnd, ...input, ...computePay(input) });
      created++;
    }
    res.status(201).json({ created, skipped: staff.length - created });
  }
);

pr.put(
  "/:id",
  [
    body("daysWorked").optional().isFloat({ min: 0, max: 31 }).withMessage("Days worked must be between 0 and 31.").toFloat(),
    body("overtimeHours").optional().isFloat({ min: 0, max: 200 }).toFloat(),
    body("allowances").optional().isFloat({ min: 0 }).toFloat(),
    body("otherDeductions").optional().isFloat({ min: 0 }).toFloat(),
  ],
  validate,
  async (req, res) => {
    const p = await Payroll.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Payroll record not found." });
    if (p.status === "Paid") return res.status(400).json({ message: "Paid payslips are locked." });
    for (const k of ["daysWorked", "overtimeHours", "allowances", "otherDeductions", "notes"]) if (k in req.body) p[k] = req.body[k];
    p.set(computePay(p));
    await p.save();
    res.json(await p.populate(POP));
  }
);

pr.post("/:id/pay", async (req, res) => {
  const p = await Payroll.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Payroll record not found." });
  p.status = "Paid"; p.paidAt = new Date();
  await p.save();
  res.json(await p.populate(POP));
});

pr.delete("/:id", async (req, res) => {
  const p = await Payroll.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Payroll record not found." });
  if (p.status === "Paid") return res.status(400).json({ message: "Paid payslips cannot be deleted." });
  await p.deleteOne();
  res.json({ ok: true });
});

r.use("/payroll", pr);
export default r;
