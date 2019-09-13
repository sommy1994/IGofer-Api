var express = require('express');
var router = express.Router();
const {validationResult} = require("express-validator");

const validate = require('../middlewares/validator');
const user_controller = require("../controllers/user.controller");


/* GET users listing. */
router.post('/register',
	validate.name,
	validate.password,
	validate.email,
	validate.phone,
	user_controller.register
);

router.post('/login', validate.email, validate.login_password, user_controller.login);

module.exports = router;
