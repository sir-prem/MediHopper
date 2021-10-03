var express             = require("express");
var ChatController      = require('../controllers/chat');
var Utils               = require('../utils/utils');
var router              = express.Router();

// set the current user
router.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

//=====================================
//
//      CHAT TEST ROUTE
//
router.get("/", ChatController.chat);

//=====================================
//
//      CHAT DASHBOARD FOR ADMIN STAFF ONLY
//
router.get("/clinic-dashboard", Utils.ensureAuthenticated, Utils.ensureAdminRole, ChatController.chatDashboard);

//=====================================
//
//      CHAT WITH USER
//
router.get("/:username", Utils.ensureAuthenticated, ChatController.chatWithUser);

module.exports = router;