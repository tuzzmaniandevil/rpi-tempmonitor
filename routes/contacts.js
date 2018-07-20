var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');
var Contact = require('../schemas/contact');

/* GET Contacts */
router.get('/', auths('ADMIN'), function (req, res, next) {
    Contact.find({}, function (err, contacts) {
        if (err) {
            next(err);
        } else {
            res.render('contacts', { title: 'Contacts', contacts: contacts });
        }
    });
});

module.exports = router;
