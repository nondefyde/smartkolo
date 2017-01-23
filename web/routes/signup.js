
var router = require('express').Router();
var signupController = require('../controllers/signup');

router.route('/signup')
    .get(signupController.signupPage)
    .post(signupController.singupPost);

module.exports = router;
