var Clinic = require('../models/clinic');
var Utils = require('../utils/utils');
const User = require('../models/user');

const NodeGeocoder = require('node-geocoder');

// options for NodeGeocoder npm package
const options = {
    provider: 'google', 
    // Optional depending on the providers
    apiKey: 'AIzaSyCFWLMNFY6YuUNRWphBPMkfXJodkz_oMAA', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };
const geocoder = NodeGeocoder(options);


async function search (req, res, next) {

    var clinics = await Clinic.find()
        .sort({ name: "ascending" })
        .exec();

    var clinicUserDataArray = await Utils.clinicsNearMe(req.body.address, 
        req.body.postcode, clinics, req.body.within*1000, geocoder);

    res.render("search", { 
        clinicUserDataArray: clinicUserDataArray,
        clinicUsername:res.locals.currentUser.clinicUsername,
        userLocation: `${req.body.address} ${req.body.postcode}`,
        withinKM: req.body.within
    });    

}

async function bookingConf (req, res, next) {

    console.log(`req.body.userLocation is ${req.body.userLocation}`);
  
    // current user's username
    var curUsername = res.locals.currentUser.username;

    // get clinic ID (from posted form's hidden variable)
    var clinicID = req.body.clinicID; 
    
    // push current user's username into clinic's queue
    // and store clinic document in variable to pass to 
    // booking confirmation page
    var clinic = await Clinic.findOneAndUpdate(
        { _id: clinicID }, 
        { $push: { queue: curUsername } },
        ).exec();

    // set joined clinic's username for current user
    var user = await User.findOneAndUpdate(
        { username: curUsername }, 
        { $set: { clinicUsername: clinic.username } },
        ).exec();
    //console.log(user);

    // Gets properties of latitude and longitude based on clinic's address
    const geoResult = await geocoder.geocode(clinic.clinicAddress());

    // Gets properties of latitude and longitude based on user's current location
    const geoUserResult = await geocoder.geocode(
        `${req.body.userLocation}`
        );

   
    const latitude = geoResult[0].latitude;
    const longitude = geoResult[0].longitude;
    console.log("latitude is: " + latitude);
    console.log("longitude is: " + longitude);
    
    // log message to console of user joining queue at clinic
    console.log(curUsername + " joined the queue at: " + clinic.clinicName());

    let curTime = await Utils.getCurTimeStr();
    
    // to be updated based on service time 
    //let waitingTime = await Utils.getClinicWaitingTime(clinic.queueCount(), clinic.approxWait());
    let etaTime = await Utils.getEtaTimeStr(clinic.approxWait());
    
    res.render("booking-confirmation", 
        { 
            clinic:     clinic,
            pointA: geoUserResult[0],
            pointB: geoResult[0],
            key:        'AIzaSyCFWLMNFY6YuUNRWphBPMkfXJodkz_oMAA',
            curTime:    curTime,
            etaTime:    etaTime,
            currentUser: res.locals.currentUser,
            clinicUsername:clinic.username
        });
}


module.exports = {
    search,
    bookingConf
}