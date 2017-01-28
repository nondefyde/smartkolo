/**
 * Created by Ekaruztech on 23/01/2017.
 */
var User = require('../models/user')
var Validator = require('validatorjs');
var helper=require('../../api/shared/helper');
var bcrypt=require('bcrypt-nodejs');
module.exports = {

    getLogin: function (req,res){
        if(req.user){
            return res.redirect("/check-activation");
        }
        res.render("auth/login",{message: req.flash('loginMessage')});
    },

    getRegister: function (req, res) {
        res.render("auth/signup", {message: req.flash('msg1')});
    },
    postRegister: function (req, res, next) {

        var obj = req.body,
            rules = User.createRules(),
            validator = new Validator(obj, rules);

        if (validator.passes()) {
            User.findOne({$or: [{email: obj.email}, {username: obj.username}]}).exec()
                .then(function (existingUser) {
                    if (existingUser) {
                        if (!existingUser.account_verified) {
                           // obj.verification_code = helper.generateOTCode();
                           // _.extend(existingUser, obj);
                           // existingUser.save(); // TODO: Take care of errors here
                            req.flash("msg1", "An unverified account associated with this detail exists!");
                            res.redirect("/signup");
                        }
                        else {
                            var message = "";
                            if (existingUser.email == obj.email) message = "A user with this email already exists";
                            if (existingUser.username == obj.username) message = "That username  has been taken";
                            error = helper.transformToError({code: 409, message: message}).toCustom();
                            req.flash("msg1", message);
                            res.redirect("/signup");
                        }
                    }
                    //if user does not exist and registering for the first time
                    obj.verification_hash = bcrypt.hashSync(obj.email + Date.now(), bcrypt.genSaltSync(10));
                    var user = new User(obj);
                    return user.save();
                })
                .then(function (savedUser) {
                    req.flash("msg1", "Thank you! A verification link has been sent to your email.");
                    res.redirect("/signup");
                }, function (err) {
                    error = helper.transformToError(err);
                    return next(error);
                });
        }
        else {
            req.flash("msg1", "There are problems with your input");
            res.redirect("/signup");
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
    //to check if a user has activated his account after reg and redirect user to appropriate page
    checkActivation: function (req,res) {
        if(!req.user){
            return res.redirect("/");
        }
        if(req.user.account_verified){
            return res.redirect("/home");
        }
        var user=req.user;

        req.logout();
        res.render("auth/check_activation",{user:user});
    },
    //To activate a user after clicking the link sent to his/her email to activate account
    signupActivation: function (req,res,next) {
        if(req.params.id && req.params.jo){
            User.findById(req.params.id).exec()
                .then(function(result){
                if(result && result.compareVerificationHash(req.params.jo)){
                    if(!result.account_verified){
                        result.account_verified=true;
                        result.save(function(err){
                            if(err) throw err;
                            return res.render("auth/signup_activation",{successType: "new"});
                        })
                    }else {
                        return res.render("auth/signup_activation",{successType: "already"});
                    }
                }else{
                    return res.send("<h1>Oops! Something's wrong</h1><h3>Your activation not successful. Try again...</h3>");
                }
            },function(err){
                    if(err){
                        console.log(err);
                        return res.send("<h1>Oops! An Error Occurrred</h1><h3>Your activation not successful. Try again...</h3>");
                        //returnnext(err)
                    }
                })
        }else{
            res.status(404).send("<h1>404!</h1><h3> Page not found</h3>");
        }

    },
    signupSuccess: function (req,res) {
        res.render("auth/signup_success");
    },
    logout: function (req, res) {
        req.session.destroy();
        req.logout();
        res.redirect("/");
    }

};
