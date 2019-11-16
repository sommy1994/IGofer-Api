const { check } = require("express-validator");

const validator = {
    service_name: [
        check("service_name")
            .not().isEmpty().withMessage("service must not be empty")
            .isString()
            .withMessage("servce must be a string")
    ],
    sub_service: [
        check("sub_service")
            .not().isEmpty().withMessage("sub service must not be empty")
            .isString()
            .withMessage("servce must be a string")
    ]
}

module.exports = {
    validator
}