const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var activateUserSchema = new Schema({
    activate_token: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
}, {
    collection: 'Acitvate_Users',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Acitvate_Users = mongoose.model("Acitvate_User", activateUserSchema);
module.exports = Acitvate_Users;