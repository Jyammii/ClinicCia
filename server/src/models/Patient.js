import mongoose from "mongoose";
import { nextSeq } from "../utils/counter.js";

const patientSchema = new mongoose.Schema(
  {
    patientNo: { type: String, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    birthdate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    sex: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true, maxlength: 250 },
    bloodType: { type: String, enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], default: "" },
    allergies: [String],
    hmo: { type: String, trim: true },
    hmoNo: { type: String, trim: true },
    emergencyName: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

patientSchema.pre("validate", async function () {
  if (this.isNew && !this.patientNo) this.patientNo = "P-" + String(await nextSeq("patient")).padStart(5, "0");
});

export default mongoose.model("Patient", patientSchema);
