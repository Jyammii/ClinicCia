import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

export const sign = (user) => jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpires });

// Verifies the Bearer token and loads the user on every request (so deactivated users lose access immediately).
export async function protect(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Please log in to continue." });
  let payload;
  try { payload = jwt.verify(token, env.jwtSecret); }
  catch { return res.status(401).json({ message: "Your session has expired. Please log in again." }); }
  const user = await User.findById(payload.id);
  if (!user || !user.active) return res.status(401).json({ message: "This account is no longer active." });
  req.user = user;
  next();
}

export const can = (user, mod) => user.role === "admin" || (user.role !== "patient" && user.permissions.includes(mod));

// Allow the request when the user holds at least one of the listed module permissions.
export const allow = (...mods) => (req, res, next) =>
  mods.some((m) => can(req.user, m)) ? next() : res.status(403).json({ message: "You do not have access to this module." });

export const staffOnly = (req, res, next) =>
  req.user.role !== "patient" ? next() : res.status(403).json({ message: "Staff only." });
