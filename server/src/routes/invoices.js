import { Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import Invoice, { PAY_METHODS, CLAIM_STATUS } from "../models/Invoice.js";
import Appointment from "../models/Appointment.js";
import { protect, allow } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { escapeRegex, round2 } from "../utils/dates.js";
import Patient from "../models/Patient.js";

const r = Router();
const POP = [{ path: "patient", select: "name patientNo hmo hmoNo phone" }];
r.use(protect, allow("billing"));
r.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));

const itemRules = [
  body("patient").isMongoId().withMessage("Choose a patient."),
  body("items").isArray({ min: 1 }).withMessage("Add at least one item."),
  body("items.*.description").trim().notEmpty().withMessage("Each item needs a description."),
  body("items.*.qty").isFloat({ min: 1 }).withMessage("Quantity must be at least 1.").toFloat(),
  body("items.*.unitPrice").isFloat({ min: 0 }).withMessage("Price cannot be negative.").toFloat(),
  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount cannot be negative.").toFloat(),
];

r.get("/", async (req, res) => {
  const filter = {};
  if (["Unpaid", "Partial", "Paid", "Void"].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), "i");
    const ids = await Patient.find({ $or: [{ name: rx }, { patientNo: rx }] }).distinct("_id");
    filter.$or = [{ invoiceNo: rx }, { patient: { $in: ids } }];
  }
  res.json(await Invoice.find(filter).sort("-createdAt").limit(300).populate(POP));
});

r.get("/:id", async (req, res) => {
  const inv = await Invoice.findById(req.params.id).populate(POP);
  inv ? res.json(inv) : res.status(404).json({ message: "Invoice not found." });
});

r.post("/", itemRules, validate, async (req, res) => {
  const { patient, items, discount = 0, notes } = req.body;
  if (!(await Patient.exists({ _id: patient }))) return res.status(404).json({ message: "Patient not found." });
  const inv = await Invoice.create({ patient, items, discount, notes, createdBy: req.user._id });
  res.status(201).json(await inv.populate(POP));
});

// One-click invoice for an appointment (consultation fee).
r.post("/from-appointment/:id", async (req, res) => {
  const a = await Appointment.findById(req.params.id).populate("doctor", "name fee");
  if (!a) return res.status(404).json({ message: "Appointment not found." });
  if (a.invoice) return res.json(await Invoice.findById(a.invoice).populate(POP));
  const inv = await Invoice.create({
    patient: a.patient,
    appointment: a._id,
    items: [{ description: `Consultation - ${a.doctor?.name || "Doctor"}${a.type === "video" ? " (video)" : ""}`, qty: 1, unitPrice: a.doctor?.fee || 0 }],
    createdBy: req.user._id,
  });
  a.invoice = inv._id;
  await a.save();
  res.status(201).json(await inv.populate(POP));
});

r.put("/:id", itemRules, validate, async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ message: "Invoice not found." });
  if (inv.status === "Void") return res.status(400).json({ message: "A voided invoice cannot be edited." });
  inv.set({ items: req.body.items, discount: req.body.discount || 0, notes: req.body.notes });
  inv.recalc();
  if (inv.total < inv.paid) return res.status(400).json({ message: "The new total is lower than what was already paid." });
  await inv.save();
  res.json(await inv.populate(POP));
});

r.post(
  "/:id/payments",
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Enter a payment amount greater than zero.").toFloat(),
    body("method").isIn(PAY_METHODS).withMessage("Choose a payment method."),
    body("ref").optional().isLength({ max: 80 }),
  ],
  validate,
  async (req, res) => {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: "Invoice not found." });
    if (inv.status === "Void") return res.status(400).json({ message: "This invoice is void." });
    if (round2(req.body.amount) > inv.balance) return res.status(400).json({ message: `Payment is more than the balance (₱${inv.balance}).` });
    inv.payments.push({ amount: round2(req.body.amount), method: req.body.method, ref: req.body.ref });
    await inv.save();
    res.status(201).json(await inv.populate(POP));
  }
);

// HMO / insurance claim tracking. Marking a claim "Paid" books the amount as an HMO payment.
r.patch(
  "/:id/claim",
  [
    body("status").isIn(CLAIM_STATUS).withMessage("Invalid claim status."),
    body("amount").optional().isFloat({ min: 0 }).toFloat(),
    body("hmo").optional().isLength({ max: 60 }),
    body("claimNo").optional().isLength({ max: 60 }),
  ],
  validate,
  async (req, res) => {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: "Invoice not found." });
    if (inv.status === "Void") return res.status(400).json({ message: "This invoice is void." });
    const cur = inv.toObject().claim || {};
    if (cur.status === "Paid") return res.status(400).json({ message: "This claim is already paid and locked." });
    const next = { ...cur };
    for (const k of ["hmo", "claimNo", "amount", "status"]) if (k in req.body) next[k] = req.body[k];
    if (next.status === "Paid") {
      if (!(next.amount > 0)) return res.status(400).json({ message: "Enter the approved claim amount before marking it paid." });
      if (next.amount > inv.balance) return res.status(400).json({ message: `Claim is more than the balance (₱${inv.balance}).` });
      inv.payments.push({ amount: next.amount, method: "HMO", ref: next.claimNo || next.hmo });
    }
    inv.claim = next;
    await inv.save();
    res.json(await inv.populate(POP));
  }
);

r.post("/:id/void", async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ message: "Invoice not found." });
  if (inv.paid > 0) return res.status(400).json({ message: "Invoices with payments cannot be voided." });
  inv.status = "Void";
  await inv.save();
  res.json(await inv.populate(POP));
});

export default r;
