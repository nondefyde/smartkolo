//Import configure.js for settings
var configure = require('./configure');

//call configure.defaults() to set global variables
configure.defaults();
//call configure.mongoose() to configure mongoose
configure.mongoose();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('config');
var _ = require('underscore');
var engine = require('ejs-mate');
var formatResponse = require('./api/shared/format-response');
var sanitize = require('./api/middlewares/sanitize');



var apiRoutes = require('./api/routes/index');
var appRoutes = require('./web/routes/index');


var app = express();
// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'web/views'));
app.set('view engine', 'ejs');
app.set('port',process.env.PORT || config.get('app.port'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Sanitize req.body, req.query, req.params
app.use(sanitize);
apiRoutes(app);
appRoutes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log("err ",JSON.stringify(err));
        var meta = {};
        meta.status_code = err.code || err.status || 500;
        meta.error = err.custom ? _.omit(err,'custom') : {code: meta.status_code, message: err.message || "Error in server interaction"};
        return res.status(meta.status_code).json(formatResponse.do(meta));
    });
}
// production error handler
// no stack traces leaked to user
app.use(function(err, req, res, next) {
    var meta = {};
    meta.status_code = err.code || err.status || 500;
    meta.error = {code: meta.status_code, message: err.message || "Error in server interaction"};
    if(err.messages)
        meta.error.messages = err.messages;
    return res.status(meta.status_code).json(formatResponse.do(meta));
});


var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('app listening on port ',app.get('port'));
});
module.exports = app;
