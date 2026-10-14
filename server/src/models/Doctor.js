import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialty: { type: String, required: true },
    hospital: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    hmos: [String],
    online: { type: Boolean, default: false },
    bio: { type: String, default: "", maxlength: 1000 },
    image: { type: String, default: "" },
    slots: { type: [String], default: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] },
    conditions: [String],
    services: [String],
    active: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // lets a doctor log in and see their own schedule
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
