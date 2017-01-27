var passport=require("passport");
var configPassport=require("../settings/passport");

var router = require('express').Router();
var indexPageController = require('../controllers/indexPage');

router.route("/")
    .get(indexPageController.indexPage)
    .post(passport.authenticate('local-login', {
        successRedirect: '/check-activation',
        failureRedirect: '/',
        failureFlash: true })
     );
module.exports = router;

