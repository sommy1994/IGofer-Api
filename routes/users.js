const express = require('express');
const router = express.Router();
const passport = require('passport');
require("../middlewares/passport");

const {validator, isAdmin} = require('../middlewares/validator');
const user_controller = require("../controllers/user.controller");

router.post('/register',
	validator.first_name,
	validator.last_name,
	validator.password,
	validator.email,
	validator.phone,
	user_controller.register
);

router.post('/login', 
	validator.email, validator.login_password, user_controller.login);

router.get('/getUsers', 
	passport.authenticate('jwt', {session: false}),
	isAdmin,
	user_controller.get_users
);

router.get('/getProfile', 
	passport.authenticate('jwt', { session: false }),
	user_controller.get_profile
)

module.exports = router;
