import mongoose from "mongoose";

export const APPT_STATUS = ["Confirmed", "Checked-in", "Completed", "Cancelled", "No-show"];

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    time: { type: String, required: true },
    type: { type: String, enum: ["clinic", "video"], default: "clinic" },
    reason: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: APPT_STATUS, default: "Confirmed" },
    active: { type: Boolean, default: true }, // false once cancelled / no-show, frees the slot
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: true }
);

// One live booking per doctor, date and time. Prevents double-booking even under race conditions.
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { active: true } });
appointmentSchema.index({ date: 1 });

export default mongoose.model("Appointment", appointmentSchema);
