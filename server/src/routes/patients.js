import { Router } from "express";
import Patient from "../models/Patient.js";
import Record from "../models/Record.js";
import Invoice from "../models/Invoice.js";
import { crud } from "../middleware/crud.js";
import { protect, allow } from "../middleware/auth.js";

const r = Router();

const router = crud(Patient, {
  read: ["emr", "billing", "appointments"],
  write: ["emr", "appointments"],
  fields: ["name", "birthdate", "sex", "phone", "email", "address", "bloodType", "allergies", "hmo", "hmoNo", "emergencyName", "emergencyPhone"],
  search: ["name", "patientNo", "phone"],
  sort: "name",
  remove: false,
});

// Patients with clinical or billing history are never hard-deleted (medical-records retention).
router.delete("/:id", protect, allow("emr"), async (req, res) => {
  const used = (await Record.exists({ patient: req.params.id })) || (await Invoice.exists({ patient: req.params.id }));
  if (used) return res.status(409).json({ message: "This patient has medical or billing records and cannot be deleted." });
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

r.use("/", router);
export default r;
