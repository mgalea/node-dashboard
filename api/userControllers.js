const Users = require('../lib/userUtils');


async function createUser(req, res, next) {
    try {
        const { username, email, password, password2, role } = req.body;
        const existUsers = Users.getAll();
        let errors = [];

        //Check filled data
        if (!email || !username || !password || !password2) {
            errors.push({ msg: 'Please fill all the fields' });

        }

        if (password !== password2) {
            errors.push({ msg: "Passwords do not match." });
        }

        if (password.length < 8) {
            errors.push({ msg: "Password must be longer than 8 characters." });
        }
        const findExist = existUsers.find(user => user.username === username)
        if (findExist) {
            errors.push({ msg: 'username already exist' })
        }
        if (errors.length > 0) {

            res.status(500).send({
                errors,
                username,
                email,
                password,
                password2
            })
        } else {
            var userData = { "id": "", "username": "", "password": "", "email": "", "role": "" };

            userData.id = Users.hashPassword(username).substr(0, 16);
            userData.username = username;
            userData.email = email;

            if (role == null) {
                userData.role = 'basic';
            } else {
                userData.role = role;
            }

            userData.password = Users.hashPassword(password);

            //append the user data
            existUsers.push(userData)

            //save the new user data
            Users.saveAll(existUsers);

            res.status(200).send({ title: 'Random Systems - Successesfully registered user ', msg: 'Successfully Registered!' });
        }
    } catch (error) {
        next(error);
    }

}

module.exports.createUser = createUser;
