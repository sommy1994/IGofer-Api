const user_model = require('../models/user');
const config = require('../config/config');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const user_controllers = {
    register : async (req, res) => {
        const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
            return `${location}[${param}]: ${msg}`;
        };
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        const salt_rounds = 10;
        const hash = await bcrypt.hash(req.body.password, salt_rounds);

        var create_user = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone_number: req.body.phone_number,
            password: hash,
        }

        const user = await user_model.findOne({ email: create_user.email }, 'email')
        if (user) {
            return res.sendStatus(403).json({
                status: false,
                msg: "email already exists"
            });
        }
        
        (new user_model(create_user)).save(err => {
            if (err) return res.sendStatus(422).json({
                status: false,
                msg: 'error in creating user'
            });

            res.sendStatus(201).json({
                status: true,
                msg: 'successfully registered, please check your mail for confirmation'
            });
        });
    }, 
    login: async (req, res) => {
        var email = req.body.email;
        var password = req.body.password;

        var user = await user_model.findOne({ email }, 'email name password phone_number');
        if (!user) {
            return res.status(404).json({
                status: false,
                msg: "user not found"
            });
        }

        var compare_passwords = await bcrypt.compare(password, user.password);
        if (!compare_passwords) {
            return res.status(404).json({
                status: false,
                msg: "authentication failed"
            });
        }
        let time = new Date();
        let hour = time.getHours();

        const payload = {
            email: user.email,
            expires: time.setHours(hour + 2)
        }

        var token = jwt.sign(payload, config.login_key, {expiresIn: '2h'}, {algorithm: 'RS256'});
        if (!token) {
            return res.status(522).json({
                status: false,
                msg: 'contact admin'
            });
        }

        res.cookie("token", token, { httpOnly: true, secure: true });
        return res.status(200).json({
            status: true,
            msg: "successfully logged in",
            payload: payload.email
        });
    }
};

module.exports = user_controllers;
