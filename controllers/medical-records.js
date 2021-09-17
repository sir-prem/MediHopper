var MedicalRecords = require("../models/medical-records");
var fs = require("fs");

function edit(req, res, next) {
  const { height, weight, health_condition, current_medication } = req.body;

  let obj = {
    username: req.user.username,
  };

  MedicalRecords.findOne(
    { username: req.user.username },
    function (err, record) {
      if (err) {
        throw err;
      }
      if (record) {
        if (height) record["height"] = height;
        if (weight) record["weight"] = weight;
        if (health_condition) record["health_condition"] = health_condition;
        if (current_medication)
          record["current_medication"] = current_medication;
        record.save();
        req.flash("info", "Medical Record Updated Successfully");
        res.redirect("/user-profile");
      } else {
        let medicalRecord = new MedicalRecords({
          username: req.user.username,
        });
        if (height) medicalRecord["height"] = height;
        if (weight) medicalRecord["weight"] = weight;
        if (health_condition)
          medicalRecord["health_condition"] = health_condition;
        if (current_medication)
          medicalRecord["current_medication"] = current_medication;
        medicalRecord.save();
        req.flash("info", "Medical Record Updated Successfully");
        res.redirect("/user-profile");
      }
    }
  );
  //res.send(req.body);
}

module.exports = {
  edit,
};
