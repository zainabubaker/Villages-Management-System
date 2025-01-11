const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String, required: true },
});

const GalleryModel = mongoose.model("Gallery", GallerySchema);

module.exports = GalleryModel;