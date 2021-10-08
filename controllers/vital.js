var Vital = require("../models/vital");
var fs = require("fs");
var randomString = require("randomstring");

function add(req, res, next) {
  const { bp_high, bp_low, heart_beat, spo2, cdate } = req.body;

  let obj = {
    id: randomString.generate(),
    bp_high,
    bp_low,
    heart_beat,
    spo2,
    cdate,
  };

  Vital.findOne({ username: req.user.username }, function (err, record) {
    if (err) {
      throw err;
    }
    if (record) {
      let old_data = record.vitals;
      record["vitals"] = [...old_data, obj];
      record.save();
      req.flash("info", "Vitals Record Updated Successfully");
      res.redirect("/user-profile");
    } else {
      let vitalRecord = new Vital({
        username: req.user.username,
        vitals: [obj],
      });
      vitalRecord.save();
      req.flash("info", "Vital Record Updated Successfully");
      res.redirect("/user-profile");
    }
  });
  //res.send(req.body);
}

function remove(req, res, next) {
  const id = req.params.id;
  console.log(req.params);
  

  Vital.findOne({ username: req.user.username }, function (err, record) {
    if (err) {
      throw err;
    }
    if (record) {
      let old_data = record.vitals;
      console.log("old data ", old_data);

      if (old_data)
        old_data = old_data.filter((item) => {
          if (item.id != id) return item;
        });

      record["vitals"] = old_data;
      record.save();
      req.flash("info", "Vitals Record Updated Successfully");
      res.redirect("/user-profile");
    } else {
      req.flash("info", "Vital Record Updated Successfully");
      res.redirect("/user-profile");
    }
  });
  //res.send(req.body);
}

module.exports = {
  add,
  remove,
};
