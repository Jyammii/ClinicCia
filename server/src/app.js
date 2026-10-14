import express from "express";
import "express-async-errors"; // forwards errors from async route handlers to the error middleware
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { sanitize } from "./middleware/sanitize.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { uploadDir } from "./middleware/upload.js";
import authRoutes from "./routes/auth.js";
import siteRoutes from "./routes/site.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import patientRoutes from "./routes/patients.js";
import recordRoutes from "./routes/records.js";
import invoiceRoutes from "./routes/invoices.js";
import inventoryRoutes from "./routes/inventory.js";
import staffRoutes from "./routes/staff.js";
import userRoutes from "./routes/users.js";
import inquiryRoutes from "./routes/inquiries.js";
import reportRoutes from "./routes/reports.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "blob:"],
    },
  },
}));
// CLIENT_URL may contain more than one URL, separated by commas.  This is
// useful when the Vercel production URL and a custom domain both use the API.
const allowedOrigins = env.clientUrl.split(",").map((url) => url.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Non-browser callers (health checks, curl) do not send an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This website is not allowed to use the API."));
  },
}));
if (env.nodeEnv !== "test") app.use(morgan("dev"));
app.use(express.json({ limit: "200kb" }));
app.use(sanitize);

app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: "Too many attempts. Please wait a few minutes." } }), authRoutes);
app.use("/api", siteRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", staffRoutes); // /api/staff, /api/shifts, /api/payroll
app.use("/api/users", userRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", notFound);

// In production the built React app is served by the same server.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(errorHandler);
export default app;
