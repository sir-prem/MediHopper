var express = require("express");
var router = express.Router();

var ClinicController = require('../controllers/clinic');
var Utils = require('../utils/utils');

router.post("/search", Utils.ensureAuthenticated, ClinicController.search);
router.get("/clinics", Utils.ensureAuthenticated, ClinicController.showclinics);
router.get("/clinicList/:clinicname", Utils.ensureAuthenticated, ClinicController.showclinicsPatients);

router.post("/booking-confirmation", Utils.ensureAuthenticated, ClinicController.bookingConf);
router.post("/remove-from-list", Utils.ensureAuthenticated, ClinicController.removeFromList);
router.post("/make-last", Utils.ensureAuthenticated, ClinicController.makeLast);

module.exports = router;