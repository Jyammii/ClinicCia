import mongoose from "mongoose";

const rx = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    medicine: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    qty: { type: Number, min: 1, default: 1 },
  },
  { _id: true }
);

// One medical encounter (visit) in a patient's electronic medical record.
const recordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    complaint: { type: String, trim: true, maxlength: 1000 },
    vitals: { bp: String, hr: Number, temp: Number, spo2: Number, weight: Number, height: Number },
    diagnosis: { type: String, trim: true, maxlength: 1000 },
    treatment: { type: String, trim: true, maxlength: 2000 },
    notes: { type: String, trim: true, maxlength: 3000 },
    prescriptions: [rx],
    labOrders: [String],
    followUp: { type: String, default: "" },
    dispensed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
recordSchema.index({ patient: 1, date: -1 });

export default mongoose.model("Record", recordSchema);
