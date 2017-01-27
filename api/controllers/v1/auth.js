/**
 * Created by Ekaruztech on 9/2/2016.
 */
var User = require('../../models/user');
var formatResponse = require('../../shared/format-response'),
    misc = require('../../shared/misc'),
    config = require('config'),
    Validator = require('validatorjs'),
    helper = require('../../shared/helper'),
    _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');




module.exports = {

    login: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {username: 'required',password:'required|min:6',device_token : 'required'},
            validator = new Validator(obj,rules);
        if(validator.passes()) {
            User.findOne({'$or': [{username:obj.username},{email:obj.username}]}).exec()
            .then(function (foundUser) {
                if (!foundUser) {
                    error =  helper.transformToError({code:404,message:"Incorrect login credentials"}).toCustom();
                    return next(error);
                }
                foundUser.device_token = obj.device_token;
                return foundUser.save();
            }).then(function (updatedUser) {
                if(!updatedUser.account_verified) {
                    updatedUser.save(); // TODO: Take care of errors here
                    meta.message = "This account has not been verified! A verification code has been sent to your email.";
                    meta.token = misc.signToken({userId:updatedUser._id,user:misc.pluckUserDetails(updatedUser)});
                    return res.status(meta.code).json(formatResponse.do(meta,updatedUser));
                }
                else if (req.body.password != null && !updatedUser.comparePassword(req.body.password)) {
                    error =  helper.transformToError({
                        code:401,message:"Incorrect password"
                    }).toCustom();
                    return next(error);
                }
                else {
                    meta.token = misc.signToken({userId:updatedUser._id,user:misc.pluckUserDetails(updatedUser)});
                    return res.status(meta.code).json(formatResponse.do(meta,updatedUser));
                }
            },function (err) {
                error =  helper.transformToError({code:503,message:"Error in server interaction",extra:err});
                return next(error);
            });
        }
        else
        {
            error =  helper.transformToError({
                code:400,message:"There are problems with your input",
                messages:helper.validationErrorsToArray(validator.errors.all())}).toCustom();
            return next(error);
        }

    },

    startRegistration: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
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
                            message = "An unverified account associated with this detail exists!";
                            meta.message = message;
                            meta.token = misc.signToken({userId:existingUser._id,user:misc.pluckUserDetails(existingUser)});
                            return res.status(meta.code).json(formatResponse.do(meta,existingUser));
                        }
                        else {
                            var message = "";
                            if(existingUser.email == obj.email) message = "A user with this email already exists";
                            if(existingUser.username == obj.username) message = "That username  has been taken";
                            error =  helper.transformToError({code:409,message:message}).toCustom();
                            throw error;
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
                    meta.message = "Thank you! A verification link has been sent your email.";
                    meta.token = misc.signToken({userId:savedUser._id,user:misc.pluckUserDetails(savedUser)});
                    res.status(meta.code).json(formatResponse.do(meta,savedUser));
                },function (err) {
                    error =  helper.transformToError(err);
                    return next(error);
                });
        }
        else
        {
            error =  helper.transformToError({
                code:400,message:"There are problems with your input",
                messages:helper.validationErrorsToArray(validator.errors.all())})
                .toCustom();
            return next(error);
        }
    },
    verifyCode: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {verification_code: 'required'},
            validator = new Validator(obj,rules);
        if(validator.passes())
        {
            var userId = req.userId;
                User.findById(userId).exec()
                    .then(function(existingUser){
                        if (!existingUser) {
                            error =  helper.transformToError({code:404,message:"This user does not exist"}).toCustom();
                            throw error;
                        }
                        else if(existingUser && existingUser.account_verified) {
                            error =  helper.transformToError({code:409,message:"This account has been verified already"}).toCustom();
                            throw error;
                        }
                        else if(existingUser && !existingUser.account_verified && existingUser.verification_code != obj.verification_code) {
                            error =  helper.transformToError({code:409,message:"Incorrect verification code!"}).toCustom();
                            throw error;
                        }
                        var updateObj = {verification_code:"",account_verified:true,active:true};
                     _.extend(existingUser,updateObj);
                    return existingUser.save();
                })
                .then(function(updatedUser){
                    meta.message = "Code verification successful!";
                    res.status(meta.code).json(formatResponse.do(meta,updatedUser));
                },function (err) {
                    console.log("error ",err);
                    error =  helper
                        .transformToError({code:err.custom ? err.code : 503,message:err.custom ? err.message : "We encountered an error while verifying your code!"});
                    return next(error);
                });

        }
        else
        {
            error =  helper.transformToError({code:400,message:"There are problems with your input",
                errors:helper.validationErrorsToArray(validator.errors.all())}).toCustom();
            return next(error);
        }

    },
    changePassword: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {current_password: 'required',password: 'required|min:6'},
            validator = new Validator(obj,rules,{'new_password.required':'Your new password is required','new_password.min':'New password must be at least 6 characters!'});
        if(validator.passes())
        {
            var userId = req.userId;
            User.findById(userId).exec()
                .then(function (existingUser) {
                    if(!existingUser) {
                        error =  helper.transformToError({code:404,message:"User not found!"}).toCustom();
                        throw error;
                    }
                    else if(existingUser && !existingUser.comparePassword(obj.current_password)) {
                        error =  helper.transformToError({code:422,message:"Operation failed, incorrect password!",}).toCustom();
                        throw error;
                    }
                    existingUser.password = obj.password;
                    return existingUser.save();
                })
                .then(function (existingUser) {
                    meta.message = "Password changed successfully!";
                    return res.status(meta.code).json(formatResponse.do(meta,existingUser));
                },function (err) {
                    error =  helper.transformToError({
                        code: err.custom ? err.code: 503,
                        message: err.custom ? err.message: "Error in server interaction!"})
                        .toCustom();
                    return next(error);
                });
        }
        else
        {
            error =  helper.transformToError({code:400,message:"There are problems with your input",
                messages:validator.errors.all()}).toCustom();
            return next(error);
        }

    },
    resetPassword: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {email: 'required|email'},
            validator = new Validator(obj,rules);
        if(validator.passes())
        {
            User.findOne({email:obj.email}).exec()
                .then(function (existingUser) {
                    if(!existingUser) {
                        error =  helper.transformToError({code:404,message:"No user found with this email!"}).toCustom();
                        throw error;
                    }
                    var newPass = helper.generateOTCode(6);
                    existingUser.password = newPass;
                    return [existingUser.save(),newPass];
                })
                .spread(function (existingUser,password) {
                    var message = "Hello, this is your new password, <b>"+password+"</b>, you can now log in and change it.";
                    helper.sendMail(config.get('email.from'),existingUser.email,"New Password",message)
                        .then(function (err) {
                            console.log('Email Error: ' + err);
                        },function (info) {
                            console.log('Email Response: ' + info);
                        });
                    meta.message = "A new password has been sent to your email!";
                    return res.status(meta.code).json(formatResponse.do(meta,existingUser));
                },function (err) {
                    error =  helper.transformToError({
                        code: err.custom ? err.code: 503,
                        message: err.custom ? err.message: "Error in server interaction!"})
                        .toCustom();
                    return next(error);
                });
        }
        else
        {
            error =  helper.transformToError({code:400,message:"There are problems with your input",
                messages:validator.errors.all()}).toCustom();
            return next(error);
        }

    }
};
