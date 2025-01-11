const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  landArea: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  demographics: {
    populationSize: { type: Number, default: 0 },
    ageDistribution: {
        age_0_14: { type: Number, default: 0 },
        age_15_64: { type: Number, default: 0 },
        age_65_plus: { type: Number, default: 0 },
      },
      genderRatios: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 },
      },
      growthRate: { type: Number, default: 0 },
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('Village', villageSchema);
