import { Router } from "express";
import { body } from "express-validator";
import User from "../models/User.js";
import { protect, sign } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const r = Router();

r.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 100 }),
    body("email").trim().toLowerCase().isEmail().withMessage("Enter a valid email address."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  validate,
  async (req, res) => {
    if (await User.exists({ email: req.body.email })) return res.status(409).json({ message: "An account with that email already exists." });
    // Role is always "patient" for self sign-up; staff accounts are created by an admin.
    const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password, role: "patient" });
    res.status(201).json({ token: sign(user), user });
  }
);

r.post(
  "/login",
  [body("email").trim().toLowerCase().isEmail().withMessage("Enter a valid email address."), body("password").notEmpty().withMessage("Password is required.")],
  validate,
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !user.active || !(await user.matches(req.body.password))) return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: sign(user), user });
  }
);

r.get("/me", protect, (req, res) => res.json({ user: req.user }));

export default r;
