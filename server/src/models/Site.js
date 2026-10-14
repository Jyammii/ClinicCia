import mongoose from "mongoose";

const tile = new mongoose.Schema({ id: String, name: String, image: { type: String, default: "" } }, { _id: false });

const siteSchema = new mongoose.Schema({
  siteName: { type: String, default: "ClinicNow", trim: true, maxlength: 60 },
  hero: { type: String, default: "" }, // video consultation banner
  landing: {
    hero: { type: String, default: "" },
    clinical: { type: String, default: "" },
    pharmacy: { type: String, default: "" },
    inventory: { type: String, default: "" },
    billing: { type: String, default: "" },
    admin: { type: String, default: "" },
  },
  contact: { address: { type: String, default: "" }, email: { type: String, default: "" }, phone: { type: String, default: "" } },
  specialties: [tile],
  conditions: [tile],
  services: [tile],
  hospitals: [tile],
  hmos: [String],
});

siteSchema.statics.get = async function () {
  return (await this.findOne()) || (await this.create({}));
};

export default mongoose.model("Site", siteSchema);
