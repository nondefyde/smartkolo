/**
 * Created by Ekaruztech on 7/19/2016.
 */
var config = require('config');
var prefix = config.get('api.prefix');
var helper = require('../shared/helper');

module.exports = function (app) {
    app.use(prefix,require('./auth'));
    app.use(prefix,require('./user'));


    app.use(config.get('api.prefix')+"/*",function (req,res, next) {
        var error = helper.transformToError({code:404,message:"Resource not found! Check your url again."})
            .toCustom();
        return next(error);
    });
};
