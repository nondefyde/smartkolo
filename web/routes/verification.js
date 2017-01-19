/**
 * Created by Ekaruztech on 12/17/2016.
 */

var config = require('config');
var router = require('express').Router();
var helper = require('../../api/shared/helper');
var VerificationController = require('../../web/controllers/verification');

router.get('/verify-me',VerificationController.getVerifyUser);

module.exports = router;
