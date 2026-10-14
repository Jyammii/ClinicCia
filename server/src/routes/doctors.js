import { Router } from "express";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { protect, allow } from "../middleware/auth.js";

const r = Router();
const FIELDS = ["name", "specialty", "hospital", "fee", "hmos", "online", "bio", "image", "slots", "conditions", "services", "active", "user"];
const pick = (b) => Object.fromEntries(FIELDS.filter((f) => f in b).map((f) => [f, b[f] === "" && f === "user" ? undefined : b[f]]));

r.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));

// Public: doctors patients can book.
r.get("/", async (req, res) => res.json(await Doctor.find({ active: true }).sort("name")));
// Admin: every doctor including inactive ones.
r.get("/manage/all", protect, allow("settings", "appointments", "emr"), async (req, res) => res.json(await Doctor.find().sort("name")));

r.get("/:id", async (req, res) => {
  const d = await Doctor.findById(req.params.id);
  d ? res.json(d) : res.status(404).json({ message: "Doctor not found." });
});
// Public: time slots already taken on a date.
r.get("/:id/taken", async (req, res) => {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "A valid date is required." });
  const rows = await Appointment.find({ doctor: req.params.id, date, active: true }).select("time");
  res.json(rows.map((a) => a.time));
});

r.post("/", protect, allow("settings"), async (req, res) => res.status(201).json(await Doctor.create(pick(req.body))));
r.put("/:id", protect, allow("settings"), async (req, res) => {
  const d = await Doctor.findById(req.params.id);
  if (!d) return res.status(404).json({ message: "Doctor not found." });
  d.set(pick(req.body));
  if (req.body.user === "") d.user = undefined;
  await d.save();
  res.json(d);
});
r.delete("/:id", protect, allow("settings"), async (req, res) => {
  if (await Appointment.exists({ doctor: req.params.id, active: true, status: { $in: ["Confirmed", "Checked-in"] } }))
    return res.status(409).json({ message: "This doctor has upcoming appointments. Mark the doctor inactive instead." });
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default r;
