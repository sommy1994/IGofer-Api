var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var localeStrategy = require("passport-local").Strategy;
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");

require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

const mongoUrl = process.env.MONGODB_URI;
mongoose
    .connect(mongoUrl, { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
