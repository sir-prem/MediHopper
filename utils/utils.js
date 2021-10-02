//===============================================
//
//    utils.js :
//
//          contains helper functions
//
//-----------------------------------------------

// uses Passport.js's isAuthenticated() method
// to confirm user authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
}


function ensureAdminRole(req, res, next) {

    if (res.locals.currentUser.role === 'admin') {
        next();
    } else {
        req.flash("info", "You must have an Admin role to see this page.");
        if (res.locals.currentUser.role === 'patient') {
            res.redirect("/user-profile");
        } else { //res.locals.currentUser.role === 'doctor'
            res.redirect("/doctor-profile");
        }
    }
}

// Gets the current time and returns it as a String
async function getCurTimeStr() {

    var currentDateObj = new Date();

    // current hours
    let curHours = currentDateObj.getHours();

    // current minutes
    let curMinutes = currentDateObj.getMinutes();

    return (curHours + ":" + curMinutes);
}

// Gets ETA of patient (expected time of arrival), 
// based on a clinic's wait time
async function getEtaTimeStr(waitTimeHours) {
    var waitTimeMlSeconds = waitTimeHours *60 * 60 * 1000;

    var currentDateObj = new Date();
    var currentMlSeconds = currentDateObj.getTime();

    var newDateObj = new Date(currentMlSeconds + waitTimeMlSeconds);

    // eta hours
    let etaHours = newDateObj.getHours();

    // current minutes
    let etaMinutes = newDateObj.getMinutes();

    return (etaHours + ":" + etaMinutes);
}

module.exports = {
    ensureAuthenticated,
    ensureAdminRole,
    getCurTimeStr,
    getEtaTimeStr
}