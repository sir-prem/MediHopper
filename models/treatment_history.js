var mongoose = require("mongoose");

var treatmentHistorySchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  history: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

var noop = function () {};

var TreatmentHistorySchema = mongoose.model(
  "TreatmentHistorySchema",
  treatmentHistorySchema
);
module.exports = TreatmentHistorySchema;
