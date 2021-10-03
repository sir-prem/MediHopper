var User = require("../models/user");
var fs = require("fs");

function homepage(req, res, next) {
    User.find()
        .sort({ createdAt: "descending" })
        .exec(function(err, users) {
            if (err) { return next(err); }
            res.render("index.ejs", { users: users });
        });
}

function signUpForm (req, res) {
    res.render("signup", {currentUser:res.locals.currentUser});
}

function signup (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    
    var role = req.body.role;

    var given, middle, family, 
        street, city, state, postcode, 
        dob, mobile, email = "";

    if (typeof req.body.given !== 'undefined') {
        given = req.body.given;
    }

    if (typeof req.body.middle !== 'undefined') {
        middle = req.body.middle;
    }

    if (typeof req.body.family !== 'undefined') {
        family = req.body.family;
    }

    if (typeof req.body.street !== 'undefined') {
        street = req.body.street;
    }

    if (typeof req.body.city !== 'undefined') {
        city = req.body.city;
    }

    if (typeof req.body.state !== 'undefined') {
        state = req.body.state;
    }

    if (typeof req.body.postcode !== 'null') {
        postcode = req.body.postcode;
    }

    if (typeof req.body.dob !== 'null') {
        dob = req.body.dob;
    }

    if (typeof req.body.mobile !== 'undefined') {
        mobile = req.body.mobile;
    }

    if (typeof req.body.email !== 'undefined') {
        email = req.body.email;
    }
    
    User.findOne({ username:username }, function(err, user) {

        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }
        
        var newUser = new User ({
            username: username,
            password: password,
            role: role,
            name: { 
                given: given,
                middle: middle,
                family: family
            },
            address: {
                street: street,
                city: city,
                state: state,
                postcode: postcode
            },
            dob: dob,
            mobile: mobile,
            email: email
        });
        console.log("req.file is: " + req.file);
        console.log("req.file.filename is: " + req.file.filename);
        console.log("req.file.path is: " + req.file.path);
        console.log("req.file.fieldname is: " + req.file.fieldname);
        //console.log("req.files[0].fieldname is: " + req.files[0].fieldname);

        newUser.profileImage.data = fs.readFileSync(req.file.path);
        newUser.profileImage.contentType = 'image/png';
        newUser.save(next);
    });
}

function userprofile (req, res) { 
    console.log(`res.locals.currentUser is: ${res.locals.currentUser}`);
    console.log(`res.locals.currentUser.clinicUsername is: ${res.locals.currentUser.clinicUsername}`);
    if (res.locals.currentUser.clinicUsername == 'undefined') {
        res.render('user-profile', {clinicUsername:'none'});
    } 
    else {
        res.render('user-profile', {clinicUsername:res.locals.currentUser.clinicUsername});
    }
}

function doctorprofile (req, res) { 
    res.render('doctor-profile');  
}

function clinicadminprofile (req, res) { 
    res.render('clinic-admin-profile');  
}

function loginForm (req, res) {
    res.render("login");
}

function loginDoctorForm (req, res) {
    res.render("doctor-login");
}

function loginClinicAdminForm (req, res) {
    res.render("clinic-admin-login");
}

// login controller, redirects to relevant profile page / dashboard
// based on user's role
function login (req, res) {
    
    const loginRoleRequest = req.body.role;
    const actualRole = req.user.role;
    console.log("login request role (from login form) is " + loginRoleRequest);
    console.log("actual role (from DB) is " + actualRole);

    if (loginRoleRequest !== actualRole) {
        req.flash("info", `You are a ${actualRole}. 
                Re-directing you to the ${actualRole} login page!`);
        switch(actualRole) {
            case "patient": res.redirect("/login"); break;
            case "doctor":  res.redirect("/doctor-login"); break;
            case "admin":   res.redirect("/clinic-admin-login");
        }
    }
    else { // loginRoleRequest === actualRole
        switch(actualRole) {
            case "patient": res.redirect("/user-profile"); break;
            case "doctor":  res.redirect("/doctor-profile"); break;
            case "admin":   res.redirect("/clinic-admin-profile");
        }
    }
}


function logout (req, res) {
    req.logout();
    res.redirect("/");
}

function editForm (req, res) {
    res.render("edit-profile");
}

function edit (req, res, next) {
    //console.log("req.body is: " + req.body);
    //console.log("req.body.street is: " + req.body.street);
    
    req.user.name.given = req.body.given;
    req.user.name.middle = req.body.middle;
    req.user.name.family = req.body.family;
    req.user.dob = req.body.dob;
    req.user.address.street = req.body.street;
    req.user.address.city = req.body.city;
    req.user.address.state = req.body.state;
    req.user.address.postcode = req.body.postcode;
    req.user.mobile = req.body.mobile;
    req.user.email = req.body.email;

    
    if (typeof req.file !== 'undefined') {
        req.user.profileImage.data = fs.readFileSync(req.file.path);
        req.user.profileImage.contentType = 'image/png';
    }

    //console.log("req.user is: " + req.user);

    req.user.save(function(err) {
        if (err) {
            next(err);
            return;
        }
        req.flash("info", "Profile updated!");

        switch(req.user.role) {
            case "patient": res.redirect("/user-profile"); break;
            case "doctor":  res.redirect("/doctor-profile"); break;
            case "admin":   res.redirect("/clinic-admin-profile");
        }
    });
    
   //res.send(req.body);
}

function deleteForm (req, res) {
    res.render("delete-profile");
}

function deleteUser (req, res, next) {
    
    const userToDelete = res.locals.currentUser.username;
    console.log("userToDelete: " + userToDelete);
    User.findOneAndRemove({username: userToDelete})
    .exec(function(err) {
        if (err) { return next(err); }
        req.flash("info", "Account successfully deleted!");
        req.logout();
        res.redirect("/");
    });
}

module.exports = {
    homepage,
    signUpForm,
    signup,
    userprofile,
    doctorprofile,
    clinicadminprofile,
    loginForm,
    loginDoctorForm,
    loginClinicAdminForm,
    login,
    logout,
    editForm,
    edit,
    deleteForm,
    deleteUser
}