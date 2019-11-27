const nodemailer = require("nodemailer");

const config = require("../config/config");
const getMailBody = require("./mailer.html");

const sendMail = async (receiver, subject, id, token) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: config.user,
            clientId: config.client_id,
            clientSecret: config.client_secret,
            refreshToken: config.refresh_token
        }
    });

    let mailBody = getMailBody(id, token);
    
    var mailOptions = {
        from: config.user,
        to: receiver,
        subject,
        html: mailBody
    }

    transporter.sendMail(mailOptions, function(err, res) {
        err? console.log(err) : console.log(res)
    })
}

module.exports = {
    sendMail
};
