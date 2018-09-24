var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');
var Settings = require('../schemas/settings');
var createError = require('http-errors');

/* GET settings */
router.get('/', auths('ADMIN'), function (req, res, next) {
    Settings.getOrCreateSettings(function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('settings', { title: 'Settings', settings: settings, sensors: req.app.locals.sensors });
        }
    });
});

module.exports = router;