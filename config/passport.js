const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../lib/userUtils');

const verifyCallback = async (username, password, done) => {
    const existUsers = User.getAll();
    const findUser = existUsers.find(user => user.username === username)
    console.log(username, password);

    if (findUser) {

        if (User.validatePassword(password, findUser.password)) {
            return done(null, findUser);
        } else {
            return done(null, false,);
        }
    }
    else {
        return done(null, false,);
    }
}
const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {

    const existUsers = User.getAll();
    const findUser = existUsers.find(user => user.id === id)
    if (findUser) {
        return done(null, findUser);
    }
    else {
        return done(null, false);
    }
});
