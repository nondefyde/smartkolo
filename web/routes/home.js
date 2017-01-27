/**
 * Created by Ekaruztech on 20/01/2017.
 */
var router = require('express').Router();
var homeController = require('../controllers/home');

router.get('/home',homeController.homePage);
module.exports = router;
