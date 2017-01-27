/**
 * Created by Emmanuel on 1/27/2017.
 */



var router = require('express').Router();
var authController = require('../controllers/auth');

router.route('/signup')
    .get(authController.getregister)
    .get(authController.getLogin)
    .get("/logout",authController.logout)

router.post('/register',authController.postRegister)
    .post('/login', authController.postLogin);


module.exports = router;
