var fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();


//get the user data into json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('./users.json')
    return JSON.parse(jsonData)
}

function hashPassword(plaintextPassword) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(plaintextPassword).digest('hex');
};

function validatePassword(plaintextPassword, hashedPassword) {
    encryptedPassword = crypto.createHmac('sha256', process.env.SECRET_KEY).update(plaintextPassword).digest('hex')
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(plaintextPassword).digest('hex') === hashedPassword ? true : false;
}

module.exports.validatePassword = validatePassword;
module.exports.hashPassword = hashPassword;
module.exports.getAll = getUserData;
module.exports.saveAll = saveUserData;

