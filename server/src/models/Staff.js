import mongoose from "mongoose";
import { nextSeq } from "../utils/counter.js";

const staffSchema = new mongoose.Schema(
  {
    employeeNo: { type: String, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    position: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    dailyRate: { type: Number, min: 0, default: 0 },
    allowance: { type: Number, min: 0, default: 0 }, // per pay period
    hireDate: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

staffSchema.pre("validate", async function () {
  if (this.isNew && !this.employeeNo) this.employeeNo = "E-" + String(await nextSeq("staff")).padStart(4, "0");
});

export default mongoose.model("Staff", staffSchema);
