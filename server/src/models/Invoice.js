import mongoose from "mongoose";
import { nextSeq } from "../utils/counter.js";
import { round2 } from "../utils/dates.js";

export const PAY_METHODS = ["Cash", "GCash", "Card", "Bank Transfer", "HMO"];
export const CLAIM_STATUS = ["None", "Submitted", "Approved", "Rejected", "Paid"];

const line = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 200 },
    qty: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, min: 0, required: true },
  },
  { _id: false }
);
const payment = new mongoose.Schema({
  amount: { type: Number, min: 0.01, required: true },
  method: { type: String, enum: PAY_METHODS, required: true },
  ref: { type: String, trim: true, maxlength: 80 },
  date: { type: Date, default: Date.now },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    items: { type: [line], validate: (v) => v.length > 0 },
    discount: { type: Number, min: 0, default: 0 },
    subtotal: Number,
    total: Number,
    paid: { type: Number, default: 0 },
    balance: Number,
    claim: {
      hmo: { type: String, trim: true },
      claimNo: { type: String, trim: true },
      amount: { type: Number, min: 0, default: 0 },
      status: { type: String, enum: CLAIM_STATUS, default: "None" },
    },
    payments: [payment],
    status: { type: String, enum: ["Unpaid", "Partial", "Paid", "Void"], default: "Unpaid" },
    notes: { type: String, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

invoiceSchema.methods.recalc = function () {
  this.subtotal = round2(this.items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
  this.total = Math.max(0, round2(this.subtotal - (this.discount || 0)));
  this.paid = round2(this.payments.reduce((s, p) => s + p.amount, 0));
  this.balance = Math.max(0, round2(this.total - this.paid));
  if (this.status !== "Void") this.status = this.total > 0 && this.paid >= this.total ? "Paid" : this.paid > 0 ? "Partial" : "Unpaid";
};

invoiceSchema.pre("validate", async function () {
  if (this.isNew && !this.invoiceNo) this.invoiceNo = `INV-${new Date().getFullYear()}-${String(await nextSeq("invoice")).padStart(5, "0")}`;
  this.recalc();
});

export default mongoose.model("Invoice", invoiceSchema);
