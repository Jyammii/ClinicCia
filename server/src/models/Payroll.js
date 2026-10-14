import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    daysWorked: { type: Number, min: 0, default: 0 },
    overtimeHours: { type: Number, min: 0, default: 0 },
    allowances: { type: Number, min: 0, default: 0 },
    otherDeductions: { type: Number, min: 0, default: 0 },
    basic: Number, overtime: Number, gross: Number,
    sss: Number, philhealth: Number, pagibig: Number, tax: Number,
    deductions: Number, net: Number,
    status: { type: String, enum: ["Draft", "Paid"], default: "Draft" },
    paidAt: Date,
    notes: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);
payrollSchema.index({ staff: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);
