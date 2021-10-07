var mongoose = require("mongoose");

var vitalSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  vitals: { type: Array },
  createdAt: { type: Date, default: Date.now },
});

var noop = function () {};

var VitalSchema = mongoose.model("VitalSchema", vitalSchema);
module.exports = VitalSchema;
