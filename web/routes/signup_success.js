/**
 * Created by ILYASANATE on 25/01/2017.
 */

var router = require('express').Router();
var signupSuccessController = require('../controllers/signup_success');

router.get('/signup-success',signupSuccessController.signupSuccessPage);
module.exports = router;
