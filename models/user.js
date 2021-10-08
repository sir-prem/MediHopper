var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    name: {
        given: String,
        middle: String,
        family: String
    },
    role: String,
    dob: { type: Date },
    address: { 
        street: String, 
        city: String, 
        state: String, 
        postcode: Number 
    },
    mobile: String,
    email: String,
    profileImage: {
        data: Buffer,
        contentType: String
        },
    clinicUsername: String
});

userSchema.methods.dispName = function() {
    return this.name.given || this.username;
};

userSchema.methods.userName = function() {
    return this.username;
};

userSchema.methods.fullName = function() {
    return this.name.given + ' ' + this.name.middle + ' ' + this.name.family;
};

var noop = function() {};

userSchema.pre("save", function(done){
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop,
            function(err, hashedPassword) {
                if (err) {return done(err); }
                user.password = hashedPassword;
                done();
            });
    });
});

userSchema.methods.checkPassword = function( guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model("User", userSchema);
module.exports = User;