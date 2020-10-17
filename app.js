var createError = require('http-errors');
var express = require('express');
var session = require('express-session')
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');
var logger = require('morgan');


/**
 * -------------- GENERAL SETUP ----------------
*/
require("dotenv").config({
  path: path.join(__dirname, ".env")
});
require('./config/passport');

var routes = require('./routes');
var FileStore = require('session-file-store')(session);

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

var app = express();
app.use(express.static(path.join(__dirname, '/public')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('common', { stream: accessLogStream }));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new FileStore({ retries: 0 }),
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  name: process.env.SESSION_COOKIE || 'connect.sid',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  }
})
);

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

/**
 * -------------- ROUTES ----------------
 */

// catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Imports all of the routes from ./routes/routes.js


app.listen(process.env.PORT || 3000);
