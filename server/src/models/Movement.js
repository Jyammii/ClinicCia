import mongoose from "mongoose";

// Audit trail of every stock change.
const movementSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    type: { type: String, enum: ["In", "Out", "Adjust", "Dispense"], required: true },
    qty: { type: Number, required: true },
    balance: Number,
    reason: { type: String, trim: true, maxlength: 200 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Movement", movementSchema);
