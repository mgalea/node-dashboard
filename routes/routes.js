var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
var fs = require('fs');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser')


// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

router.use(express.json());

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'MGA  Compliance Portal - Random Systems International', header: 'Dashboard' });
});

/* GET login */
router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login Page' });

});

router.post('/login', urlencodedParser, userController.login);

/* GET passwords. */
router.get('/password', function (req, res, next) {
    res.render('password', { title: 'Random Systems - Forgot Password', header: 'Forgot Password' });

});

/* GET passwords. */
router.get('/dashboard', function (req, res, next) {
    res.render('dashboard', { title: 'Random Systems - Dashboard', header: 'Dashboard' });

});


/* Create - POST method */
router.post('/user/add', urlencodedParser, async (req, res) => {
    //get the existing user data
    const existUsers = getUserData()

    //get the new user data from post request
    const userData=req.body;

    //check if the userData fields are missing
    if (userData.email == null || userData.username == null || userData.password == null) {
        return res.status(401).send({ error: true, msg: 'User data missing' })
    }

    //check if the username exist already
    const findExist = existUsers.find(user => user.username === userData.username)
    if (findExist) {
        return res.status(409).send({ error: true, msg: 'username already exist' })
    }

    if (userData.role == null) {
        userData.role = 'basic';
    }

    userData.password = await hashPassword(userData.password);
    userData.accessToken = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    //append the user data
    existUsers.push(userData)

    //save the new user data
    saveUserData(existUsers);
    res.send({ success: true, msg: 'User data added successfully' })

})

/* Read - GET method */
router.get('/user/list', (req, res) => {
    const users = getUserData()
    res.send(users)
})

/* Update - Patch method */
router.patch('/user/update/:username', urlencodedParser, async (req, res) => {
    //get the username from url
    const username = req.params.username

    //get the update data
    const userData = req.body

    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findExist = existUsers.find(user => user.username === username)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'username not exist' })
    }
    if(userData.email !==null) {
        findExist.email =userData.email;
    }
    if (userData.password !== null) {
        findExist.password = await hashPassword(userData.password);
    }

    findExist.accessToken = jwt.sign(findExist, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
    
    //filter the userdata
    const updateUser = existUsers.filter(user => user.username !== username)

    //push the updated data
    updateUser.push(findExist);

    //finally save it
    saveUserData(updateUser)

    res.send({ success: true, msg: 'User data updated successfully' })
})

/* Delete - Delete method */
router.delete('/user/delete/:username', (req, res) => {
    const username = req.params.username

    //get the existing userdata
    const existUsers = getUserData()

    //filter the userdata to remove it
    const filterUser = existUsers.filter(user => user.username !== username)

    if (existUsers.length === filterUser.length) {
        return res.status(409).send({ error: true, msg: 'username does not exist' })
    }

    //save the filtered data
    saveUserData(filterUser)

    res.send({ success: true, msg: 'User removed successfully' })

})


/* util functions */

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('./users.json')
    return JSON.parse(jsonData)
}


router.get('/*', function (req, res, next) {
    res.render('notfound', { title: 'Random Systems - error', header: 'error' });

});

module.exports = router;
