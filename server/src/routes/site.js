import { Router } from "express";
import Site from "../models/Site.js";
import { protect, allow } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const r = Router();
const EDITABLE = ["siteName", "hero", "landing", "contact", "specialties", "conditions", "services", "hospitals", "hmos"];

r.get("/site", async (req, res) => res.json(await Site.get()));

r.patch("/site", protect, allow("settings"), async (req, res) => {
  const site = await Site.get();
  for (const k of EDITABLE) if (k in req.body) site.set(k, req.body[k]);
  await site.save();
  res.json(site);
});

// Admin image uploads. Returns a URL that is stored on the site / doctor record.
r.post("/upload", protect, allow("settings"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please choose an image file." });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default r;
