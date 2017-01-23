/**
 * Created by Ekaruztech on 12/17/2016.
 */

//Import configure.js for settings
var configure = require('../configure');

//settings to work with web
var setting=require('../settings');

//call configure.defaults() to set global variables
configure.defaults();
//call configure.mongoose() to configure mongoose
configure.mongoose();

module.exports = function (app) {
    //call the settings to work with web
    setting(app);

    //app.use(require('./verification'));
    app.use(require('../middlewares/checkUserLogin'));
    app.use(require('./indexPage'));
    app.use(require('./home'));
    app.use(require('./signup'));
    app.use(require('./logout'));
    app.get("*",function (req,res, next) {
      res.status(404).send("<h1>404!</h1><h3>Page not found</h3>");
    });
};
