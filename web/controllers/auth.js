/**
 * Created by Ekaruztech on 23/01/2017.
 */
var User = require('../models/user');
module.exports = {

    getLogin: function (req, res) {
        res.render("auth/login", {message: req.flash('msg1')});
    },

    getregister: function (req, res) {
        res.render("auth/register", {message: req.flash('msg1')});
    },
    postRegister: function (req, res, next) {

        var obj = req.body,
            rules = User.createRules(),
            validator = new Validator(obj,rules);

        if(validator.passes())
        {
            User.findOne({$or: [{email:obj.email},{username:obj.username}]}).exec()
                .then(function (existingUser) {
                    if(existingUser) {
                        if(!existingUser.account_verified)
                        {
                            obj.verification_code = helper.generateOTCode();
                            _.extend(existingUser,obj);
                            existingUser.save(); // TODO: Take care of errors here
                            req.flash("msg1","An unverified account is associated with this detail exists!");
                            res.redirect("/register");
                        }
                        else {
                            var message = "";
                            if(existingUser.email == obj.email) message = "A user with this email already exists";
                            if(existingUser.username == obj.username) message = "That username  has been taken";
                            error =  helper.transformToError({code:409,message:message}).toCustom();
                            req.flash("msg1",message);
                            res.redirect("/register");
                        }
                    }
                    obj.verification_hash =  bcrypt.hashSync(obj.email+Date.now(),bcrypt.genSaltSync(10));
                    if(req.file && req.file.location)
                        obj.avatar = req.file.location;
                    if(Object.hasOwnProperty.call(obj,'longitude') && Object.hasOwnProperty.call(obj,'latitude')){
                        obj.coordinates = [obj.longitude,obj.latitude];
                        delete obj.longitude;
                        delete obj.latitude;
                    }
                    var user = new User(obj);
                    return user.save();
                })
                .then(function (savedUser) {
                    req.flash("msg1","Thank you! A verification link has been sent your email.");
                    res.redirect("/register");
                },function (err) {
                    error =  helper.transformToError(err);
                    return next(error);
                });
        }
        else
        {
            req.flash("msg1","There are problems with your input");
            res.redirect("/register");
        }

        // if (req.body.username && req.body.fname && req.body.lname && req.body.email && req.body.cpassword && req.body.password) {
        //     if (req.body.password == req.body.cpassword) {
        //         User.findOne({username: req.body.username.toLowerCase()}, function (err, result) {
        //             if (err) return next(err);
        //             if (result) {
        //                 req.flash("msg1", "User already exists");
        //                 res.redirect("/signup");
        //                 return;
        //             }
        //             User.findOne({email: req.body.email.toLowerCase()}, function (err, rs) {
        //                 if (err) return next(err);
        //                 if (rs) {
        //                     req.flash("msg1", "This email is already used");
        //                     res.redirect("/signup");
        //                     return;
        //                 }
        //                 User.create({
        //                     username: req.body.username,
        //                     name: {
        //                         fname: req.body.fname,
        //                         lname: req.body.lname
        //                     },
        //                     email: req.body.email,
        //                     password: req.body.password,
        //                 }, function (err, user) {
        //                     if (err) return next(err);
        //                     if (!user) {
        //                         req.flash("msg1", "No user was created");
        //                         res.redirect("/signup");
        //                     }
        //                     req.flash("msg1", "Signup Successful");
        //                     res.redirect("/signup");
        //                 });
        //             })
        //         });
        //     } else {
        //         req.flash("msg1", "Password not matched");
        //         res.redirect("/signup");
        //         return;
        //     }
        //
        // } else {
        //     req.flash("msg1", "All fields must be filled");
        //     res.redirect("/signup");
        // }

    },
    logout: function(req,res){
        req.session.destroy();
        req.logout();
        res.redirect("/");
    }

};
