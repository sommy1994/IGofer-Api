const {
    check
} = require("express-validator");

// const name = [
//     check("name")
//         .isString()
//         .not().isEmpty()
// ];

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
                .not().isEmpty().withMessage("does not match")
                .matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})").withMessage("does not match")
                .withMessage("password must have 1 lowercase, 1 uppercase, 1 special character and 8 characters long")
                .custom((value, {req}) => {
                    let confirm_password = req.body.confirm_password;
                    if (!confirm_password) {
                        throw new Error('password confirmation should not be blank');
                    } else if (value !== req.body.confirm_password) {
                        throw new Error('passwords dont match');
                    } else {
                        return true;
                    }
                })
    ],
    email: [
        check('email')
            .not().isEmpty()
            .isEmail()
            .withMessage("please provide a valid email")
    ],
    phone: [
        check('phone_number')
            .not().isEmpty()
            .isString()
            .withMessage("phone number should not be empty")
    ]
};

module.exports = validator;