/**
 * Created by ILYASANATE on 25/01/2017.
 */

var router = require('express').Router();
var signupActivationController = require('../controllers/signup_activation');

router.get('/signup-activation/:id/:jo',signupActivationController.signupActivationPage);
module.exports = router;
