const service_model = require("../models/service");
const sub_service_model = require("../models/sub_service");
const config = require("../config/config");
const { validationResult } = require("express-validator");
const error_log = require("../errorLogs/error_log");

const errorFormatter = ({msg}) => {
    return {msg};
};

const service_controllers = {
    add_service: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        var service_name = req.body.service_name.toLowerCase();

        const service = await service_model.findOne({ service_name });
        if (service){
            return res.status(403).send({
                status: false,
                msg: "service already exists"
            });
        }

        (new service_model({service_name})).save(err => {
            if (err) return res.status(422).send({
                status: false,
                msg: 'error in creating service'
            });

            res.status(201).send({
                status: true,
                msg: 'successfully added service'
            });
        });
    },

    add_sub_service: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        var sub_service = {
            service_id : req.params.id,
            sub_service : req.body.sub_service.toLowerCase()
        }
        
        let service = await service_model.findOne({ _id: sub_service.service_id });
        if (!service){
            return res.status(403).send({
                status: false,
                msg: "service does not exist, please create one"
            });
        }

        let sub_service_check = await sub_service_model.findOne({sub_service: sub_service.sub_service});
        if (sub_service_check)
            return res.status(403).send({
                status: false,
                msg: "sub service already exists"
            });

        (new sub_service_model(sub_service)).save(err => {
            if (err) return res.status(422).send({
                status: false,
                msg: 'error in saving sub service'
            });

            res.status(201).send({
                status: true,
                msg: 'successfully created a sub service'
            });
        })
    },

    get_services: async (req, res) => {
        let services = await service_model.find({}, "service_name");

        res.status(200).json({
            status: true,
            payload: services
        });
    },

    get_sub_service: async(req, res) => {
        var id = req.params.id;

        if (!id)    
            return res.status(422).json({
                status: false,
                msg: "please provide a service id"
            });
        
        var service_id = await service_model.findById(id);
        if (!service_id)
            return res.status(404).json({
                status: false,
                msg: "please provide a valid service id"
            });
        
        var sub_service = await sub_service_model.find({ service_id }, 'sub_service');
        res.send(sub_service);
    },

    delete_service: async(req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        let id = req.params.id;
        try {
            if (!id)
                return res.status(422).send({
                    status: false,
                    msg: "please provide an id"
                });
            

            let service = await service_model.findByIdAndDelete(id);
            console.log(service)
            if (!service) {
                error_log(id, "at service delete", 'service controller')
                return res.status(400).send({
                    status: false,
                    msg: "error deleting service"
                });
            }

            let sub_service = await sub_service_model.deleteMany({ service_id: {$in: id} });
            if (!sub_service) {
                error_log(id, "at sub_service delete", 'service controller')
                return res.status(400).send({
                    status: false,
                    msg: "an error occured while deleting"
                });
            }

            res.status(200).send({
                status: true,
                msg:"successfully deleted service and associated sub services"
            });
        } catch (error) {
            error_log(id, "at delete service catch error", 'service controller', error)
            res.status(500).send("an error occured");
        }

    },

    delete_sub_service: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        try {
            let id = req.params.id;
            if (!id)
                return res.status(422).send({
                    status: false,
                    msg: "please provide an id"
                });

            let sub_service = await sub_service_model.findByIdAndDelete(id);
            if (!sub_service) {
                error_log(id, "at sub_service find", 'service controller')
                return res.status(404).send({
                    status: false,
                    msg: "could not find sub_service"
                });
            }

            res.status(200).send({
                status: true,
                msg: "sub_service was successfully deleted"
            })
        } catch (error) {
            error_log(id, "at delete sub_service catch error", 'service controller', error)
            res.status(500).send("an error occured");
        }
    }
}

module.exports = service_controllers;