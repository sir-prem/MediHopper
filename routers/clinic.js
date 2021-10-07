var express = require("express");
var router = express.Router();

var ClinicController = require('../controllers/clinic');
var Utils = require('../utils/utils');

router.post("/search", Utils.ensureAuthenticated, ClinicController.search);
router.get("/clinics", Utils.ensureAuthenticated, ClinicController.showclinics);
router.get("/clinicList", Utils.ensureAuthenticated, ClinicController.showclinicList);

router.post("/booking-confirmation", Utils.ensureAuthenticated, ClinicController.bookingConf);

module.exports = router;