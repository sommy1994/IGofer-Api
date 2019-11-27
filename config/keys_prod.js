require("dotenv").config();

module.exports = {
    mongo_url: process.env.MONGODB_URI,
    login_key: process.env.login_key,
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    refresh_token: process.env.refresh_token,
    user: process.env.user,
    domain: "igofer-app.herokuapp.com"
};

