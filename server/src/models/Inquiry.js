import mongoose from "mongoose";

// "Request a demo" submissions from the public landing page.
const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    clinic: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 30 },
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
