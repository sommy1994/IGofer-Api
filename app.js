var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var path = require("path");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var localeStrategy = require("passport-local").Strategy;
var bodyParser = require("body-parser");
var createError = require('http-errors');
var mongoose = require("mongoose");
var helmet = require('helmet');
var cors = require("cors");

var usersRouter = require("./routes/users");

var app = express();

const mongoUrl =  require("./config/config").mongo_url;
mongoose
    .connect(mongoUrl, { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected with " + mongoUrl))
    .catch(err => console.log(err));

app.use(passport.initialize());

app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  next(createError(404, 'Page not found'));
});

module.exports = app;
