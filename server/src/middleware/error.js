import { env } from "../config/env.js";

export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ message: errors[0] || "Validation failed.", errors });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid value supplied." });
  if (err.code === 11000) return res.status(409).json({ message: `That ${Object.keys(err.keyPattern || {})[0] || "value"} is already taken.` });
  if (err.name === "MulterError") return res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "Image is too large. Maximum size is 2MB." : err.message });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 && env.nodeEnv === "production" ? "Something went wrong." : err.message });
}
