import { Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import Appointment, { APPT_STATUS } from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import { protect, allow, can } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { todayPH, escapeRegex } from "../utils/dates.js";

const r = Router();
r.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));

// A doctor account only sees its own schedule.
export async function doctorScope(user) {
  if (user.role !== "doctor") return {};
  const d = await Doctor.findOne({ user: user._id });
  return { doctor: d ? d._id : null };
}

r.get("/", protect, async (req, res) => {
  const filter = {};
  const staff = can(req.user, "appointments");
  if (!staff) filter.bookedBy = req.user._id; // patients: own bookings only
  else Object.assign(filter, await doctorScope(req.user));
  const { date, status, doctor } = req.query;
  if (staff && /^\d{4}-\d{2}-\d{2}$/.test(date || "")) filter.date = date;
  if (staff && APPT_STATUS.includes(status)) filter.status = status;
  if (staff && mongoose.isValidObjectId(doctor) && filter.doctor === undefined) filter.doctor = doctor;
  res.json(await Appointment.find(filter).sort("-date time").limit(500).populate("doctor", "name specialty fee").populate("patient", "name patientNo"));
});

r.post(
  "/",
  protect,
  [
    body("doctorId").isMongoId().withMessage("Choose a doctor."),
    body("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Choose a valid date."),
    body("time").trim().notEmpty().withMessage("Choose a time."),
    body("type").optional().isIn(["clinic", "video"]),
    body("patientName").trim().notEmpty().withMessage("Patient name is required.").isLength({ max: 100 }),
    body("phone").trim().matches(/^[0-9+()\-\s]{7,20}$/).withMessage("Enter a valid mobile number."),
    body("reason").optional().isLength({ max: 500 }).withMessage("Reason is too long."),
  ],
  validate,
  async (req, res) => {
    const { doctorId, date, time, type = "clinic", patientName, phone, reason = "" } = req.body;
    const doc = await Doctor.findById(doctorId);
    if (!doc || !doc.active) return res.status(404).json({ message: "Doctor not found." });
    if (date < todayPH()) return res.status(400).json({ message: "You cannot book a date in the past." });
    if (!doc.slots.includes(time)) return res.status(400).json({ message: "That time is not offered by this doctor." });
    if (type === "video" && !doc.online) return res.status(400).json({ message: "This doctor does not offer video consults." });

    let patient = await Patient.findOne({ user: req.user._id, name: new RegExp(`^${escapeRegex(patientName)}$`, "i") });
    if (!patient) patient = await Patient.create({ name: patientName, phone, user: req.user._id });

    try {
      const appt = await Appointment.create({ doctor: doc._id, bookedBy: req.user._id, patient: patient._id, patientName, phone, date, time, type, reason });
      res.status(201).json(appt);
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ message: "Sorry, that slot was just taken. Please choose another time." });
      throw e;
    }
  }
);

// Patients can cancel their own confirmed booking; staff can cancel any.
r.patch("/:id/cancel", protect, async (req, res) => {
  const a = await Appointment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Appointment not found." });
  const staff = can(req.user, "appointments");
  if (!staff && String(a.bookedBy) !== String(req.user._id)) return res.status(403).json({ message: "Not your appointment." });
  if (a.status !== "Confirmed") return res.status(400).json({ message: "Only confirmed appointments can be cancelled." });
  a.status = "Cancelled"; a.active = false;
  await a.save();
  res.json(a);
});

r.patch("/:id/status", protect, allow("appointments"), [body("status").isIn(APPT_STATUS).withMessage("Invalid status.")], validate, async (req, res) => {
  const a = await Appointment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Appointment not found." });
  a.status = req.body.status;
  a.active = !["Cancelled", "No-show"].includes(a.status);
  try { await a.save(); }
  catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "That slot has since been booked by someone else." });
    throw e;
  }
  res.json(a);
});

export default r;
