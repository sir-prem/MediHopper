var mongoose = require("mongoose");

var medicalRecordSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String },
  age: { type: String },
  dob: { type: Date },
  sex: { type: String },
  height: { type: String },
  weight: { type: String },
  health_condition: { type: String },
  current_medication: { type: String },
  createdAt: { type: Date, default: Date.now },
});

var noop = function () {};

var MedicalRecordSchema = mongoose.model(
  "MedicalRecordSchema",
  medicalRecordSchema
);
module.exports = MedicalRecordSchema;
