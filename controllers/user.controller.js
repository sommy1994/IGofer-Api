const user_model = require('../models/user');
const config = require('../config/config');
const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const errorFormatter = ({msg}) => {
    return {msg};
};

const user_controllers = {
    register : async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        const salt_rounds = 10;
        const hash = await bcrypt.hash(req.body.password, salt_rounds);

        var create_user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
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

        try {
            var user = await user_model.findOne({ email });
            if (!user) {
                return res.status(404).send({
                    status: false,
                    msg: "user not found"
                });
            }
            
            var compare_passwords = await bcrypt.compare(password, user.password);
            if (!compare_passwords) {
                return res.status(401).send({
                    status: false,
                    msg: "authentication failed"
                });
            }

            // var token = jwt.sign(payload, config.login_key, {expiresIn: '2h'}, {algorithm: 'RS256'});
            var token = JWT.sign({
                iss: 'IGofer',
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

            return res.status(200).send({
                status: true,
                msg: "successfully logged in",
                payload: user.email,
                token
            });
        } catch (error) {
            res.status(500).send("An internal error occured");
        }
        
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
    },
    get_profile: async (req, res) => {
        res.status(200).send(req.user);
    }
};

module.exports = user_controllers;
