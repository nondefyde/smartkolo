/**
 * Created by Malcom on 9/7/2016.
 */
var jwt = require('jsonwebtoken');
var config = require('config');
var _ = require('underscore');


exports.signToken = function (obj) {
    return jwt.sign(obj, config.get('authToken.superSecret'), {expiresIn: config.get('authToken.expiresIn')}); // expires in 24 hours
};

exports.pluckUserDetails = function (user) {
    return _.pick(user,'_id','email','avatar','username');
};