const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const uuidv1 = require('uuid/v1');

const user_model = require('../models/user');
const activate_user_model = require('../models/activate.model');
const config = require('../config/config');
const { sendMail } = require('../middlewares/mailer');
const error_log = require('../errorLogs/error_log');

const errorFormatter = ({msg}) => {
    return {msg};
};

const activateToken = () => {
    return token = uuidv1();
}

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
        
        const user = await user_model.findOne({ email: create_user.email }, 'email');

        try {
            if (user) {
                return res.status(403).send({
                    status: false,
                    msg: "email already exists"
                });
            }
            
            const user_to_Save = new user_model(create_user);
            const user_saved = await user_to_Save.save();

            if (!user_saved)
                return res.status(500).send({
                    status: false,
                    msg: "error in creating user"
                });

            let activate_token = await activateToken();
            let activate_user = {
                activate_token,
                user_id : user_saved.id
            }

            const user_to_activate = new activate_user_model(activate_user);
            const user_activate = await user_to_activate.save();

            if (!user_activate) {
                user_model.findByIdAndDelete(user_saved.id);
                return res.status(500).send({
                    status: false,
                    msg: "error in creating user"
                });
            }

            sendMail(create_user.email, "Confirm your account on iGofer", user_saved.id, activate_token);

            res.status(201).send({
                status: true,
                msg: 'successfully registered, please check your mail for confirmation'
            });

        } catch (error) {
            await user_model.findOneAndDelete({ email: create_user.email});
            error_log(create_user.email, "from register user", "register", error);
            res.status(500).send({
                status: false,
                msg: 'an error occurred, please contact admin'
            });
        }

    }, 

    /** Login controller */
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

            // check for user role and append as neccessary
            var role = undefined;
            user.isAdmin ? role = 'admin' : role = 'user';

            return res.status(200).send({
                status: true,
                msg: "successfully logged in",
                payload: {email: user.email, role},
                token
            });
        } catch (error) {
            res.status(500).send("An internal error occured");
        }
        
    },

    /** GET USERS CONTROLLER */
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

    /** GET PROFILE CONTROLLER */
    get_profile: async (req, res) => {
        res.status(200).send(req.user);
    },

    /**ACTIVATE USER CONTROLLER */
    activate: async (req, res) => {
        let id = req.body.params.id;
        let token = req.body.params.token;

        if (!id || !token)
            return res.status(403).send({
                status: false,
                msg: 'please provide neccesarry parameters'
            });

        try {
            const activate_user = await activate_user_model.findOne({ activate_token: token });
            if (!activate_user)
                return res.status(403).send('unauthorized');
            
            if (activate_user.user_id !== id)
                return res.status(403).send("unauthorized");

            const user = await user_model.findById(id);
            if (!user){
                return res.status(404).send({
                    status: false,
                    msg: "user not found"
                });
            }

            if (user.activated) {
                return res.status(204).send({
                    status: false,
                    msg: "user has already been activated"
                });
            }

            user.activated = true;
            user.save(function (err, done)  {
                if (err) {
                    error_log(id, "at user activate save", "activate", err);
                    return res.status(500).send({
                        status: false,
                        msg: "user could not be activated"
                    });
                }

                activate_user_model.findOneAndDelete({ activate_token: token });
                return res.status(200).send({
                    status: true,
                    msg: "user has been activated"
                });
            });
        } catch (error) {
            error_log(id, "at catch user activate save", "activate", error);
            res.status(500).send({
                status: false,
                msg: "an error occured, please contact admin"
            });
        }
        
    }
};

module.exports = user_controllers;
