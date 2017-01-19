/**
 * Created by Emmanuel on 4/30/2016.
 */
var config = require('config');
var router = require('express').Router();
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var uuid = require('node-uuid');
var Validator = require('validatorjs');
var apiVersion = ('v'+process.env.API_VERSION).toLowerCase();
var AuthController = require('../controllers/'+apiVersion+ '/auth');
var checkToken = require('../../api/middlewares/auth_token');
var User = require('../models/user');

var s3 = new aws.S3(config.get('aws.credentials'));
var uploadAvatar = multer({
    fileFilter: function (req, file, cb) {
        var obj = req.body;
        var validator = new Validator(obj,User.createRules());
        if (validator.passes() && ('email' in obj && 'username' in obj) && file.mimetype.toLowerCase().startsWith("image")){
            User.findOne({$or: [{email:obj.email},{username:obj.username}]}).exec()
                .then(function (foundUser) {
                    if(!foundUser)
                       return cb(null, true);
                    else
                        return cb(null, false);
                },function (err) {
                    console.log("Error from file filter");
                    return cb(null, false);
                });
        }
        return cb(null, false);
    },

    storage: multerS3({
        s3: s3,
        bucket: config.get('aws.bucket'),
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname, mimetype: file.mimetype});
        },
        key: function (req, file, cb) {
            var ext = file.originalname.split(".").pop();
            var prefix = "avatars/" +uuid.v1()+"."+ext;
            cb(null, prefix);
        }
    })
});


//Middleware to check authorization token
router.use(checkToken);
router.post('/register',uploadAvatar.single('avatar'), AuthController.startRegistration)
    .post('/verify-code', AuthController.verifyCode)
    .post('/change-password', AuthController.changePassword)
    .post('/reset-password', AuthController.resetPassword)
    .post('/login', AuthController.login);

module.exports = router;
