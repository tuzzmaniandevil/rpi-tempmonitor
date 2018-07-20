var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    } else {
        res.render('login', { title: 'Login' });
    }
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

router.get('/logout', function (req, res, next) {
    req.logout();

    return res.redirect('/');
});

module.exports = router;