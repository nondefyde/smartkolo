/**
 * Created by Emmanuel on 4/30/2016.
 */
var config = require('config');
var router = require('express').Router();
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var apiVersion = ('v'+process.env.API_VERSION).toLowerCase();
var UserController = require('../controllers/'+apiVersion+ '/user');
var uuid = require('node-uuid');
var checkToken = require('../../api/middlewares/auth_token');
var misc = require('../../api/shared/misc');
var helper = require('../../api/shared/helper');


var s3 = new aws.S3(config.get('aws.credentials'));
var updateAvatar = multer({
    fileFilter: function (req, file, cb) {
        cb(null, file.mimetype.toLowerCase().startsWith("image") && req.userId ==req.user._id);
    },
    storage: multerS3({
        s3: s3,
        bucket: config.get('aws.bucket'),
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname,mimetype:file.mimetype});
        },
        key: function (req, file, cb) {
            var ext = file.originalname.split(".").pop();
            var user = req.user;
            var fileName = (user && user.avatar && user.avatar.length > 0) ? helper.getFilename(user.avatar) : uuid.v1()+"."+ext;
            var prefix = "avatars/" + fileName;
            console.log("fileName ",fileName);
            cb(null, prefix);
        }
    })
});
//Middleware to check authorization token
router.use(checkToken);
/*user_id param*/
router.param('user_id',UserController.userIdParam);
router.route('/users/by-email/:email')
    .get(UserController.getUserByEmail);
router.get('/users/:user_id/followers',UserController.getUserFollowers);
router.get('/users/:user_id/following',UserController.getUserFollowing);
router.get('/users/:user_id/follows-count',UserController.getUserFollowsCount);

router.post('/users/follow',UserController.followUser);
router.post('/users/unfollow',UserController.unfollowUser);
router.route('/users/:user_id')
    .get(UserController.findOne)
    .put(updateAvatar.single('avatar'),UserController.update);
router.get('/users',UserController.find);

module.exports = router;