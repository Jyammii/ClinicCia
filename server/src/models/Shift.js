import mongoose from "mongoose";

export const SHIFT_TIMES = { Morning: ["07:00", "15:00"], Afternoon: ["15:00", "23:00"], Night: ["23:00", "07:00"], Custom: ["", ""] };

const shiftSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    type: { type: String, enum: Object.keys(SHIFT_TIMES), default: "Morning" },
    start: String,
    end: String,
    status: { type: String, enum: ["Scheduled", "Present", "Absent", "Leave"], default: "Scheduled" },
    notes: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);
shiftSchema.index({ staff: 1, date: 1 });

shiftSchema.pre("validate", function () {
  if (!this.start && SHIFT_TIMES[this.type]) [this.start, this.end] = SHIFT_TIMES[this.type];
});

export default mongoose.model("Shift", shiftSchema);
