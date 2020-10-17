const router = require('express').Router();
const passport = require('passport');
const User = require('../api/userControllers')

/**
 * -------------- DEFAULT PAGE IF NOT LOGGED IN----------------
 */

function isLogged(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.message = "Please log in first"
        res.redirect('/login');
    }
}

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success' }));
router.post('/register', User.createUser);

/**
* -------------- GET ROUTES ----------------
*/

router.get('/', (req, res, next) => {
    res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {

    if (req.isAuthenticated()) {
        res.render('dashboard', {
            header: 'Hello ' + req.user.username + '.You are Authenticated as ' + req.user.role + ' user.'
        })

    } else {
        res.render('login', { widgetHeader: 'Log in with your username' });
    }

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    res.render('register', {
        title: 'EARP - New User Registration', widgetHeader: 'Fill all the details below'
    });

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/password', (req, res, next) => {

    res.render('password', {
        title: 'EARP - Change user password', widgetHeader: 'Fill all the details below'
    });

});

router.get('/protected-route', isLogged, (req, res, next) => {

    res.render('dashboard', {
        header: 'Hello ' + req.user.username + '.You are Authenticated as ' + req.user.role + ' user.'
    })

});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.session.destroy(() => {
        res.clearCookie(process.env.SESSION_COOKIE || 'connect.sid');
        res.redirect('/login');
    });

});

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.render('login', { widgetHeader: 'Invalid username or password.', widgetSubheader: 'Try Again' });

});

module.exports = router;