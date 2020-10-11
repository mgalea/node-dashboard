const express = require('express')
const fs = require('fs')

const app = express()

//this line is required to parse the request body
app.use(express.json())

/* Create - POST method */
app.post('/user/add', (req, res) => {
    //get the existing user data
    const existUsers = getUserData()
    
    //get the new user data from post request
    const userData = req.body

    //check if the userData fields are missing
    if (userData.fullname == null || userData.age == null || userData.username == null || userData.password == null) {
        return res.status(401).send({error: true, msg: 'User data missing'})
    }
    
    //check if the username exist already
    const findExist = existUsers.find( user => user.username === userData.username )
    if (findExist) {
        return res.status(409).send({error: true, msg: 'username already exist'})
    }
    
    userData.password = await hashPassword(userData.password);

    userData.accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    //append the user data
    existUsers.push(userData)

    //save the new user data
    saveUserData(existUsers);
    res.send({success: true, msg: 'User data added successfully'})

})

/* Read - GET method */
app.get('/user/list', (req, res) => {
    const users = getUserData()
    res.send(users)
})

/* Update - Patch method */
app.patch('/user/update/:username', (req, res) => {
    //get the username from url
    const username = req.params.username

    //get the update data
    const userData = req.body

    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findExist = existUsers.find( user => user.username === username )
    if (!findExist) {
        return res.status(409).send({error: true, msg: 'username not exist'})
    }

    //filter the userdata
    const updateUser = existUsers.filter( user => user.username !== username )

    //push the updated data
    updateUser.push(userData)

    //finally save it
    saveUserData(updateUser)

    res.send({success: true, msg: 'User data updated successfully'})
})

/* Delete - Delete method */
app.delete('/user/delete/:username', (req, res) => {
    const username = req.params.username

    //get the existing userdata
    const existUsers = getUserData()

    //filter the userdata to remove it
    const filterUser = existUsers.filter( user => user.username !== username )

    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'username does not exist'})
    }

    //save the filtered data
    saveUserData(filterUser)

    res.send({success: true, msg: 'User removed successfully'})
    
})


/* util functions */

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('users.json')
    return JSON.parse(jsonData)    
}

/* util functions ends */
