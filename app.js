var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var path = require("path");
var passport = require("passport");
var bodyParser = require("body-parser");
var createError = require('http-errors');
var mongoose = require("mongoose");
var helmet = require('helmet');
var cors = require("cors");

var usersRouter = require("./routes/users");
var servicesRouter = require("./routes/services");

var app = express();

const mongoUrl =  require("./config/config").mongo_url;
mongoose
    .connect(mongoUrl, { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected with " + mongoUrl))
    .catch(err => console.log(err));

app.use(passport.initialize());
app.use(cors());
app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.status(204).json());
app.use("/users", usersRouter);
app.use("/services", servicesRouter);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
