/**
 * Created by Emmanuel on 4/30/2016.
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var config = require('config');
var helper = require('../shared/helper');
var aws = require('aws-sdk');
var s3 = new aws.S3(config.get('aws.credentials'));
var url = require('url');

var UserSchema = new Schema({

    email : { type: String, unique : true, lowercase: true },
    username : {type:String},
    password : {type:String,minlength: 6},
    first_name : { type: String},
    last_name : { type: String},
    mobile : { type: String},
    sex : { type: String},
    avatar: { type : String, default: ""},
    bio: { type : String},
    city: {type: String},
    country: { type: String},
    coordinates: [Number],
    active : { type: Boolean, default: false},
    verification_hash: {type:String, default: ""},
    password_reset_token: {type:String},
    password_reset_expiration: {type:Date},
    account_verified : { type: Boolean, default: false},
    device_token: { type : String, default: ""}
},{
    timestamps: true
});

UserSchema.index({'coordinates': '2dsphere' });

UserSchema.statics.createRules = function() {
    return {
        email : 'required|email',
        password : 'required|min:6',
        username : 'required|min:2',
        device_token : 'required'
    }
};

UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt){
        if(err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.post('save', function(doc){
    if(!doc.account_verified)
    {
        if(('email' in doc && doc.email) && ('verification_hash' in doc && doc.verification_hash))
        {
            var urlString = "http://"+config.get('app.baseUrl')+"/verify-me?email="+doc.email+"&access_xters="+doc.verification_hash;
            var message = "<p>Hi "+doc.username+", thank you for choosing to be part of us at smartkolo, " +
                "use the below link to activate your account!</p>"+urlString;
            helper.sendMail(config.get('email.from'),doc.email,"Verify your account!",message)
                .then(function (err) {
                    console.log('Email Error: ' + err);
            },function (info) {
                    console.log('Email Response: ' + info);
            });
        }
    }
});

/*
UserSchema.post('save', function(doc){
    if(!doc.account_verified)
    {
        if('mobile' in doc && 'verification_code' in doc)
        {
            var message = "Please enter this code, "+doc.verification_code+" to continue";
            helper.sendSMS(doc.mobile,message)
                .then(function (successResponse) {
                    console.info("smsResponse ",successResponse);
                }, function (error) {
                    console.error("Twilio error ",error);
                });
        }
    }
});*/
UserSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

UserSchema.post('remove', function(doc) {
    console.log('%s has been removed', doc._id);
    var key = url.parse(doc.avatar).path.substring(1);
    s3.deleteObjects({
        Bucket: config.get('aws.bucket'),
        Delete: {
            Objects: [ { Key: key } ]
        }
    }, function(err, data) {

        if (err)
            console.log("User avatar delete error ",err);
        else
            console.log('User avatar deleted!');

    });
});

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size){
    if(!this.size) size = 200;
    if(!this.email) return 'https://gravatar.com/avatar/?s' +size+'&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' +md5+'?s=' + size +'&d=retro';
};
UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
