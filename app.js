var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

var indexRouter = require('./routes/routes');

var app = express();
app.use(express.static(__dirname + '/public'));
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('common', { stream: accessLogStream }));
app.use('/', indexRouter);


app.use(cookieParser());

//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

//this line is required to parse the request body

// catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);

    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
    }
    res.locals.loggedInUser = await User.findById(userId); next();
  } else {
    next();
  }
});

module.exports = app;
