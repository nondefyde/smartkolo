/**
 * Created by ILYASANATE on 26/01/2017.
 */
var router = require('express').Router();
var checkActivationController = require('../controllers/checkActivation');

router.get('/check-activation',checkActivationController.checkActivationPage);
module.exports = router;
