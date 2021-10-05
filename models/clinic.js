var mongoose = require("mongoose");

var clinicSchema = mongoose.Schema({
    username: String, //references User Schema
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    postcode: { type: String, required: true },
    service: { type: Number, required: true, default: 25},
    phone: String,
    website: String,
    queue: [String]
});

clinicSchema.methods.clinicName = function() {
    return this.name;
};

clinicSchema.methods.clinicAddress = function() {
    return this.address;
};

clinicSchema.methods.clinicPostcode = function() {
    return this.postcode;
};

clinicSchema.methods.clinicPhone = function() {
    return this.phone;
};

clinicSchema.methods.queueCount = function() {
    return this.queue.length;
};
clinicSchema.methods.serviceTime = function() {
    return this.service;
};
clinicSchema.methods.approxWait = function() {

    let minWait = this.service - this.service * 0.25;
    let maxWait = this.service + this.service * 0.25;      
    let waitingTime = this.queue.length * (Math.random(Math.random() * (maxWait - minWait) + minWait)); //The maximum is exclusive and the minimum is inclusive    

    return waitingTime.toFixed(2);
}

var Clinic = mongoose.model("Clinic", clinicSchema);
module.exports = Clinic;