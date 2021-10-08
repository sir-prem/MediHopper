//===============================================
//
//    utils.js :
//
//          contains helper functions
//
//-----------------------------------------------

const Clinic    = require("../models/clinic");
const User      = require("../models/user");

// npm package which utilises google-distance-matrix api 
// to calculate distances, driving time etc
const distance  = require('google-distance');
distance.apiKey = 'AIzaSyCFWLMNFY6YuUNRWphBPMkfXJodkz_oMAA';

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
async function getClinicWaitingTime(queueLength, approxWait) {

    let minWait = approxWait - approxWait * 0.25;
    let maxWait = approxWait + approxWait * 0.25;      

    return (queueLength * (Math.random(Math.random() * (maxWait - minWait) + minWait))); //The maximum is exclusive and the minimum is inclusive
}



// function that returns a promise on success of google map data
// including distance and travel time (by driving)
function getDistance(mapParams) {

    return new Promise(function(resolve, reject) {

        distance.get(
            mapParams,
            function(err, data) {
            if (err) return console.log(err);
                resolve(data);
            });

    });

}

//returns json tuple { clinic model, distance data, clinic user} for a given clinic
async function clinicDistToMe(address, postcode, clinic, geocoder) {

    var jsonOutputTuple;

    var user = await User.findOne({username: clinic.username}).exec();

    var geoResultSearchedPostcode = await geocoder.geocode({
        address: address,
        country: 'Australia',
        zipcode: postcode
        });
    var geoResultClinic = await geocoder.geocode(clinic.address);

    var postcodeCoords = {
        lat: geoResultSearchedPostcode[0].latitude,
        long: geoResultSearchedPostcode[0].longitude
    };
    var clinicCoords = {
        lat: geoResultClinic[0].latitude,
        long: geoResultClinic[0].longitude
    };
    
    var mapParams = {
        origin: `${postcodeCoords.lat}, ${postcodeCoords.long}`,
        destination: `${clinicCoords.lat}, ${clinicCoords.long}`,
        mode: 'driving',
        units: 'metric',
        index: 1
        };


    return new Promise(function(resolve, reject) {

        getDistance(mapParams)
        .then(function(data) {  // once promise is fulfilled

            jsonOutputTuple = {
                user: user,
                clinic: clinic,
                data: data
            };
            resolve(jsonOutputTuple);

        });

    });
}

// given all the clinics in an array, this function returns an array of 
// {clinic, user, mapData} tuples for the clinics within a given proximity of
// my location
async function clinicsNearMe(myAddress, myPostcode, clinicsArray, withinMetres, geocoder) {

    var clinicUserDataArray = [];

    for (i = 0; i < clinicsArray.length; i++) {

        await clinicDistToMe(myAddress, myPostcode, clinicsArray[i], geocoder)
        .then((clinicUserDataTuple)=> {  // obtain resulting tuple once the promise 
                                    // is fulfilled
                                    
            if (clinicUserDataTuple.data.distanceValue <= withinMetres) {
                clinicUserDataArray.push(clinicUserDataTuple);
            }
        });
    }
    return clinicUserDataArray;
}

module.exports = {
    ensureAuthenticated,
    getClinicWaitingTime,
    ensureAdminRole,
    getCurTimeStr,
    getEtaTimeStr,
    clinicDistToMe,
    clinicsNearMe
}