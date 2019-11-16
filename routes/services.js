const express = require("express");
const router = express.Router();
const passport = require("passport");

require("../middlewares/passport");
const service_controller = require("../controllers/service.controller");
const { validator } = require("../middlewares/service.validation");
const { isAdmin, isValidObjectId } = require("../middlewares/validator");

router.get('/getServices',
    passport.authenticate('jwt', {session: false}),
    service_controller.get_services);

router.get('/getSubServices/:id', 
    passport.authenticate('jwt', {session: false}),
    isValidObjectId,
    service_controller.get_sub_service );

router.post('/addServices', 
    passport.authenticate('jwt', {session: false}),
    isAdmin,
    validator.service_name, 
    service_controller.add_service);

router.post('/addSubServices/:id', 
    passport.authenticate('jwt', {session: false}),
    isAdmin,
    isValidObjectId,
    validator.sub_service, 
    service_controller.add_sub_service);

router.delete('/deleteService/:id', 
    passport.authenticate('jwt', {session: false}),
    isAdmin, 
    isValidObjectId,
    service_controller.delete_service)

router.delete('/deleteSubService/:id', 
    passport.authenticate('jwt', {session: false}),
    isAdmin, 
    isValidObjectId,
    service_controller.delete_sub_service)

module.exports = router;
