import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = ["admin", "doctor", "nurse", "receptionist", "pharmacist", "cashier", "patient"];
export const MODULES = ["appointments", "emr", "billing", "inventory", "staff", "reports", "settings", "users"];
export const ROLE_DEFAULTS = {
  admin: MODULES,
  doctor: ["appointments", "emr"],
  nurse: ["appointments", "emr"],
  receptionist: ["appointments", "billing"],
  pharmacist: ["inventory", "emr"],
  cashier: ["billing"],
  patient: [],
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: "patient" },
    permissions: [{ type: String, enum: MODULES }],
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.matches = function (plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.set("toJSON", { transform: (_, r) => { delete r.password; delete r.__v; return r; } });

export default mongoose.model("User", userSchema);
