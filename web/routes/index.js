/**
 * Created by Ekaruztech on 12/17/2016.
 */
//settings to work with web
var setting=require('../settings/settings');
module.exports = function (app) {
    //call the settings to work with web
    setting(app);

    //app.use(require('./verification'));
    app.use(require('../middlewares/checkUserLogin'));
    app.use(require("./auth"));
    app.use(require('./home'));
    app.get("*",function (req,res, next) {
      res.status(404).send("<h1>404!</h1><h3>Page not found</h3>");
    });
};
