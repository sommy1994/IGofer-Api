const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var serviceSchema = new Schema({
    service_name: {
        type: String,
        required: true
    }
}, {
    collection: 'Services',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Services = mongoose.model("Service", serviceSchema);
module.exports = Services;
