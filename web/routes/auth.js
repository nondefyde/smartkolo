/**
 * Created by Emmanuel on 1/27/2017.
 */


var passport=require("passport");
var configPassport=require("../settings/passport");
var router = require('express').Router();
var authController = require('../controllers/auth');

router.route('/signup')
    .get(authController.getRegister)
    .post(authController.postRegister)

router.route("/")
    .get(authController.getLogin)
    .post(passport.authenticate('local-login', {
        successRedirect: '/check-activation',
        failureRedirect: '/',
        failureFlash: true })
    )


router.get('/signup-activation/:id/:jo',authController.signupActivation)
    .get('/signup-success',authController.signupSuccess)
    .get('/check-activation',authController.checkActivation)
    .get("/logout",authController.logout)

module.exports = router;
