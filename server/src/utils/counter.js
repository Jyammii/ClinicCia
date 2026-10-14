import mongoose from "mongoose";

const Counter = mongoose.models.Counter || mongoose.model("Counter", new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }));

// Atomic auto-increment used for patient, invoice and employee numbers.
export const nextSeq = async (name) =>
  (await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true })).seq;
