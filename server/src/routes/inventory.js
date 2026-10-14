import { Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import Item, { CATEGORIES } from "../models/Item.js";
import Movement from "../models/Movement.js";
import { crud } from "../middleware/crud.js";
import { protect, allow } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addDays, todayPH } from "../utils/dates.js";

const r = Router();

// Doctors (EMR) need a read-only medicine list for prescriptions. Must be declared before "/:id".
r.get("/medicines", protect, allow("emr", "inventory"), async (req, res) => {
  res.json(await Item.find({ category: "Medicine" }).select("name unit qty").sort("name"));
});

r.get("/movements", protect, allow("inventory"), async (req, res) => {
  const filter = mongoose.isValidObjectId(req.query.item) ? { item: req.query.item } : {};
  res.json(await Movement.find(filter).sort("-createdAt").limit(200).populate("item", "name unit").populate("by", "name"));
});

const router = crud(Item, {
  read: ["inventory"],
  write: ["inventory"],
  fields: ["name", "sku", "category", "unit", "qty", "reorderLevel", "cost", "price", "expiry", "supplier", "location"],
  search: ["name", "sku", "supplier"],
  sort: "name",
  filter: (req) => {
    const f = {};
    if (CATEGORIES.includes(req.query.category)) f.category = req.query.category;
    if (req.query.low === "1") f.$expr = { $lte: ["$qty", "$reorderLevel"] };
    if (req.query.expiring === "1") f.expiry = { $ne: "", $lte: addDays(todayPH(), 60) };
    return f;
  },
});

// Stock in / out / manual adjustment with an audit trail.
router.post(
  "/:id/adjust",
  protect,
  allow("inventory"),
  [
    body("type").isIn(["In", "Out", "Adjust"]).withMessage("Choose In, Out or Adjust."),
    body("qty").isFloat({ min: 0 }).withMessage("Quantity must be zero or more.").toFloat(),
    body("reason").optional().isLength({ max: 200 }),
  ],
  validate,
  async (req, res) => {
    const { type, qty, reason } = req.body;
    if (type !== "Adjust" && qty <= 0) return res.status(400).json({ message: "Quantity must be greater than zero." });
    let item;
    if (type === "In") item = await Item.findByIdAndUpdate(req.params.id, { $inc: { qty } }, { new: true });
    else if (type === "Out") {
      item = await Item.findOneAndUpdate({ _id: req.params.id, qty: { $gte: qty } }, { $inc: { qty: -qty } }, { new: true });
      if (!item) return res.status(409).json({ message: "Not enough stock for that removal." });
    } else item = await Item.findByIdAndUpdate(req.params.id, { qty }, { new: true }); // Adjust = set exact count
    if (!item) return res.status(404).json({ message: "Item not found." });
    await Movement.create({ item: item._id, type, qty, balance: item.qty, reason, by: req.user._id });
    res.json(item);
  }
);

r.use("/", router);
export default r;
