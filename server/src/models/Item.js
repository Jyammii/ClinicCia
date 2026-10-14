import mongoose from "mongoose";

export const CATEGORIES = ["Medicine", "Supply", "Equipment"];

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sku: { type: String, trim: true, maxlength: 40 },
    category: { type: String, enum: CATEGORIES, default: "Medicine" },
    unit: { type: String, trim: true, default: "pcs" },
    qty: { type: Number, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 10 },
    cost: { type: Number, min: 0, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    expiry: { type: String, default: "" },
    supplier: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
