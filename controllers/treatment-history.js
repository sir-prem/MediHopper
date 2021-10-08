var TreatmentHistorySchema = require("../models/treatment_history");
var fs = require("fs");
var randomString = require("randomstring");

function add(req, res, next) {
  const { disease, type, doctor, hospital, cdate } = req.body;

  let obj = {
    id: randomString.generate(),
    disease,
    type,
    doctor,
    hospital,
    cdate,
  };

  TreatmentHistorySchema.findOne(
    { username: req.user.username },
    function (err, record) {
      if (err) {
        throw err;
      }
      if (record) {
        let old_data = record.history;
        record["history"] = [...old_data, obj];
        record.save();
        req.flash("info", "Treatment Record Updated Successfully");
        res.redirect("/user-profile");
      } else {
        let treatmentHistoryRecord = new TreatmentHistorySchema({
          username: req.user.username,
          history: [obj],
        });
        treatmentHistoryRecord.save();
        req.flash("info", "Treatment Record Updated Successfully");
        res.redirect("/user-profile");
      }
    }
  );
  //res.send(req.body);
}

function remove(req, res, next) {
  const id = req.params.id;

  TreatmentHistorySchema.findOne(
    { username: req.user.username },
    function (err, record) {
      if (err) {
        throw err;
      }
      if (record) {
        let old_data = record.history;

        if (old_data)
          old_data = old_data.filter((item) => {
            if (item.id != id) return item;
          });

        record["history"] = old_data;
        record.save();
        req.flash("info", "Treatment Record Updated Successfully");
        res.redirect("/user-profile");
      } else {
        req.flash("info", "Treatment Record Updated Successfully");
        res.redirect("/user-profile");
      }
    }
  );
  //res.send(req.body);
}

module.exports = {
  add,
  remove,
};
