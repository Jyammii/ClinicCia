import { Router } from "express";
import mongoose from "mongoose";
import Record from "../models/Record.js";
import Item from "../models/Item.js";
import Movement from "../models/Movement.js";
import { crud } from "../middleware/crud.js";
import { protect, allow } from "../middleware/auth.js";

const r = Router();

const router = crud(Record, {
  read: ["emr", "inventory"],
  write: ["emr"],
  fields: ["patient", "doctor", "appointment", "date", "complaint", "vitals", "diagnosis", "treatment", "notes", "prescriptions", "labOrders", "followUp"],
  filter: (req) => (mongoose.isValidObjectId(req.query.patient) ? { patient: req.query.patient } : {}),
  populate: [{ path: "doctor", select: "name specialty" }, { path: "patient", select: "name patientNo" }],
  sort: "-date -createdAt",
  stamp: (req) => ({ createdBy: req.user._id }),
});

// Pharmacy: hand out the prescribed medicines and deduct them from stock.
router.post("/:id/dispense", protect, allow("inventory"), async (req, res) => {
  const rec = await Record.findById(req.params.id);
  if (!rec) return res.status(404).json({ message: "Record not found." });
  if (rec.dispensed) return res.status(400).json({ message: "This prescription was already dispensed." });
  const lines = rec.prescriptions.filter((p) => p.item);
  const items = await Item.find({ _id: { $in: lines.map((l) => l.item) } });
  for (const l of lines) {
    const it = items.find((i) => String(i._id) === String(l.item));
    if (!it) return res.status(400).json({ message: `${l.medicine} is no longer in inventory.` });
    if (it.qty < l.qty) return res.status(409).json({ message: `Not enough stock for ${it.name} (have ${it.qty}, need ${l.qty}).` });
  }
  for (const l of lines) {
    // The qty >= condition keeps stock from going negative if two pharmacists dispense at once.
    const it = await Item.findOneAndUpdate({ _id: l.item, qty: { $gte: l.qty } }, { $inc: { qty: -l.qty } }, { new: true });
    if (!it) return res.status(409).json({ message: `Stock for ${l.medicine} changed while dispensing. Please try again.` });
    await Movement.create({ item: it._id, type: "Dispense", qty: l.qty, balance: it.qty, reason: `Rx for record ${rec._id}`, by: req.user._id });
  }
  rec.dispensed = true;
  await rec.save();
  res.json(rec);
});

r.use("/", router);
export default r;
