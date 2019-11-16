const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var sub_serviceSchema = new Schema({
    sub_service: {
        type: String,
        required: true
    },
    service_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    collection: 'SubServices',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const sub_services = mongoose.model("subService", sub_serviceSchema);
module.exports = sub_services;