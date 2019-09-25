const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    password: {
        required: true,
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isWorker: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'Users',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;