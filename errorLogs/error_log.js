const fs = require("fs");
const path = require("path");

const error_log = (id , text, controller, othError = "") => {
    var dateObj = new Date();
    
    let texts = `${dateObj}: from "${controller}" at "${text}" with id = "${id}" and other error" "${othError}" \n`;
    fs.appendFile(path.resolve(__dirname, 'error.txt'), 
        texts, (err) => {
            if (err) return console.log(err)

            console.log("written to file")
        });
}

module.exports = error_log;