import { Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import User, { ROLES, MODULES, ROLE_DEFAULTS } from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { escapeRegex } from "../utils/dates.js";

const r = Router();
r.use(protect, allow("users"));
r.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));

const rules = (creating) => [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
  body("email").trim().toLowerCase().isEmail().withMessage("Enter a valid email address."),
  creating
    ? body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    : body("password").optional({ values: "falsy" }).isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("role").isIn(ROLES).withMessage("Choose a valid role."),
  body("permissions").optional().isArray().withMessage("Permissions must be a list."),
  body("permissions.*").isIn(MODULES).withMessage("Unknown permission."),
];

r.get("/", async (req, res) => {
  const f = {};
  if (req.query.q) { const rx = new RegExp(escapeRegex(String(req.query.q)), "i"); f.$or = [{ name: rx }, { email: rx }]; }
  res.json(await User.find(f).sort("name").limit(300));
});

r.post("/", rules(true), validate, async (req, res) => {
  const { name, email, password, role, phone, active = true } = req.body;
  const permissions = Array.isArray(req.body.permissions) && req.body.permissions.length ? req.body.permissions : ROLE_DEFAULTS[role];
  const u = await User.create({ name, email, password, role, phone, active, permissions });
  res.status(201).json(u);
});

r.put("/:id", rules(false), validate, async (req, res) => {
  const u = await User.findById(req.params.id).select("+password");
  if (!u) return res.status(404).json({ message: "User not found." });
  const self = String(u._id) === String(req.user._id);
  if (self && (req.body.role !== "admin" || req.body.active === false)) return res.status(400).json({ message: "You cannot remove your own admin access." });
  u.set({ name: req.body.name, email: req.body.email, role: req.body.role, phone: req.body.phone, active: req.body.active ?? u.active });
  if (Array.isArray(req.body.permissions)) u.permissions = req.body.permissions;
  if (req.body.password) u.password = req.body.password;
  await u.save();
  res.json(u);
});

r.delete("/:id", async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: "You cannot delete your own account." });
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default r;
