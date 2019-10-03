const {
    check
} = require("express-validator");
const JWT = require('jsonwebtoken');
const config = require('../config/config');
const user_model = require('../models/user');

const validator = {
    name: [
        check("name")
            .not().isEmpty()
            .isString()
            .withMessage("name must be a string and not empty")
    ],
    password: [
        //[.matches] the string must contain 1 lowercase, 1 uppercase, 1 numeric character
        // 1 special character and must be eight characters or longer
        check('password')
            .not().isEmpty().withMessage("password should not be empty")
            .matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
            .withMessage("password must have 1 lowercase, 1 uppercase, 1 special character and 8 characters long"),
        check('confirm_password', 'password confirmation field must have the same value as the password field')
            .not().isEmpty().withMessage("confirm password should not be empty")
            .custom((value, { req }) => value === req.body.password)
    ],
    email: [
        check('email')
            .not().isEmpty().withMessage("email cannot be blank")
            .normalizeEmail().isEmail().withMessage("please provide a valid email")
    ],
    phone: [
        check('phone_number')
            .not().isEmpty().withMessage("phone number cannot be empty")
            .isString().withMessage("phone number should be a string")
            .isLength({min: 11}).withMessage("phone number should not be less than 11")
    ], 
    login_password: [
        check('password')
            .not().isEmpty().withMessage("password should not be empty")
    ]
};

const isAdmin = async (req, res, next) => {
    try {
        if (req && req.cookies) {

            var token = req.headers['authorization'];
            if (!token)
                return res.status(401).send('unauthorized no header');
            
            var decoded = JWT.verify(token, config.login_key);
            if (!decoded)
                return res.status(401).send("unauthorized false token");
            
            var user = await user_model.findById(decoded.sub);
            if (!user)
                return res.status(404).send("user not found");
            if (!user.isAdmin)
                return res.status(401).send("unauthorized not admin");

            next();
        }
        
    } catch (error) {
        res.status(422).send({status: false, message: 'An error occured'});
    }
}

module.exports = {validator, isAdmin};