import { Router } from "express";
import mongoose from "mongoose";
import { protect, allow } from "./auth.js";
import { escapeRegex } from "../utils/dates.js";

/**
 * Generic REST CRUD router.
 *  read / write : module permissions allowed to read / modify
 *  fields       : whitelist of body keys (protects against mass-assignment)
 *  search       : fields matched by ?q=
 *  filter(req)  : extra Mongo filter built from query string
 *  populate     : mongoose populate spec
 *  create:false : skip POST (when a custom create handler exists)
 */
export function crud(Model, o) {
  const r = Router();
  const pick = (b = {}) => Object.fromEntries(o.fields.filter((f) => f in b).map((f) => [f, b[f]]));
  r.param("id", (req, res, next, id) => (mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id." })));

  r.get("/", protect, allow(...o.read), async (req, res) => {
    const filter = o.filter ? o.filter(req) : {};
    if (req.query.q && o.search) filter.$or = o.search.map((f) => ({ [f]: new RegExp(escapeRegex(String(req.query.q)), "i") }));
    res.json(await Model.find(filter).sort(o.sort || "-createdAt").limit(500).populate(o.populate || ""));
  });
  r.get("/:id", protect, allow(...o.read), async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(o.populate || "");
    doc ? res.json(doc) : res.status(404).json({ message: "Not found." });
  });
  if (o.create !== false) {
    r.post("/", protect, allow(...o.write), async (req, res) => {
      const doc = await Model.create({ ...pick(req.body), ...(o.stamp ? o.stamp(req) : {}) });
      res.status(201).json(await doc.populate(o.populate || ""));
    });
  }
  r.put("/:id", protect, allow(...o.write), async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found." });
    doc.set(pick(req.body));
    await doc.save();
    res.json(await doc.populate(o.populate || ""));
  });
  if (o.remove !== false) {
    r.delete("/:id", protect, allow(...o.write), async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      doc ? res.json({ ok: true }) : res.status(404).json({ message: "Not found." });
    });
  }
  return r;
}
