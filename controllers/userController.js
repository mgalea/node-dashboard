// server/controllers/userController.js

//const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('../bin/roles')
var fs = require('fs');

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
exports.login = async (req, res, next) => {
    try {
        const {username,password} = req.body;

        //get the existing userdata
        const existUsers = getUserData()

        //filter the userdata to find if user exist
        const findExist = existUsers.find(user => user.username === username)
        if (!findExist) {
            return res.status(409).send({ error: true, msg: 'username does not exist: '+ username })
        }

        const validPassword = await validatePassword(password, findExist.password);

        if (!validPassword) return res.status(409).send({ error: true, msg: 'Wrong Password.' })

        accessToken = jwt.sign(findExist, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        findExist.accessToken=accessToken;

        //filter the userdata
        const updateUser = existUsers.filter(user => user.username !== username)
        //push the updated data
        updateUser.push(findExist)

        //finally save it
        saveUserData(updateUser)

        res.status(200).json({
            data: { username: findExist.username, role: findExist.role },
            accessToken
        })
        
    } catch (error) {
        next(error);
    }
}


exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync( './users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('./users.json')
    return JSON.parse(jsonData)
}