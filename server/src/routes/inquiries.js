import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import Inquiry from "../models/Inquiry.js";
import { crud } from "../middleware/crud.js";
import { validate } from "../middleware/validate.js";

const r = Router();

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests. Please try again later." } });

// Public "Request a demo" form.
r.post(
  "/",
  limiter,
  [
    body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 100 }),
    body("email").trim().toLowerCase().isEmail().withMessage("Enter a valid email address."),
    body("clinic").optional().isLength({ max: 120 }),
    body("phone").optional({ values: "falsy" }).matches(/^[0-9+()\-\s]{7,20}$/).withMessage("Enter a valid phone number."),
    body("message").optional().isLength({ max: 1000 }).withMessage("Message is too long."),
  ],
  validate,
  async (req, res) => {
    const { name, clinic, email, phone, message } = req.body;
    await Inquiry.create({ name, clinic, email, phone, message });
    res.status(201).json({ ok: true });
  }
);

r.use("/", crud(Inquiry, { read: ["settings"], write: ["settings"], fields: ["status", "notes"], search: ["name", "email", "clinic"], create: false }));
export default r;
