var mongoose = require("mongoose");

var clinicSchema = mongoose.Schema({
    username: String, //references User Schema
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    postcode: { type: String, required: true },
    phone: String,
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

clinicSchema.methods.approxWait = function() {
    return this.queue.length * 0.25;
}

var Clinic = mongoose.model("Clinic", clinicSchema);
module.exports = Clinic;