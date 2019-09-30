const user_model = require('../models/user');
const config = require('../config/config');
const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const errorFormatter = ({ location, msg, param}) => {
    return `${location}[${param}]: ${msg}`;
};

const user_controllers = {
    register : async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.send({ errors: errors.array() });
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
            return res.status(403).send({
                status: false,
                msg: "email already exists"
            });
        }
        
        (new user_model(create_user)).save(err => {
            if (err) return res.status(422).send({
                status: false,
                msg: 'error in creating user'
            });

            res.status(201).send({
                status: true,
                msg: 'successfully registered, please check your mail for confirmation'
            });
        });
    }, 
    login: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
            if (!errors.isEmpty()){
                return res.status(422).send({ errors: errors.array() });
        }

        var email = req.body.email;
        var password = req.body.password;

        var user = await user_model.findOne({ email }, 'email name password phone_number');
        if (!user) {
            return res.status(404).send({
                status: false,
                msg: "user not found"
            });
        }

        var compare_passwords = await bcrypt.compare(password, user.password);
        if (!compare_passwords) {
            return res.status(404).send({
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

        // var token = jwt.sign(payload, config.login_key, {expiresIn: '2h'}, {algorithm: 'RS256'});
        var token = JWT.sign({
            iss: 'IGoder',
            sub: user.id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 1)
        }, config.login_key);

        if (!token) {
            return res.status(522).send({
                status: false,
                msg: 'contact admin'
            });
        }

        res.cookie("token", token, { httpOnly: true, secure: true });
        return res.status(200).send({
            status: true,
            msg: "successfully logged in",
            payload: payload.email,
            token
        });
    },
    get_users: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array() });
        }

        var users = await user_model.find({});
        var usersDTO = {};

        users.forEach((user, i) => {
            usersDTO[i] = {
                email: user.email,
                name: user.name,
                phone_number: user.phone_number
            }
        });

        res.status(200).send({status: true, data: usersDTO})
    }
};

module.exports = user_controllers;
