var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');
var Contact = require('../schemas/contact');
var checkRequired = require('../bin/requiredFields');

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

/**
 * Create a new Contact
 */
router.post('/add', auths('ADMIN'), function (req, res, next) {
    if (checkRequired(req, res, ['firstName'])) {
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var mobile = req.body.mobile;
        var landline = req.body.landline;

        if (!(mobile && mobile.trim().length > 0) && !(landline && landline.trim().length > 0)) {
            res.json({
                status: false,
                message: 'Please specify a mobile and/or landline number',
                fields: ['mobile', 'landline']
            });
        } else {
            Contact.create({
                firstName: firstName,
                lastName: lastName,
                mobile: mobile,
                landline: landline
            }, (err, newContact) => {
                if (err) {
                    res.json({
                        status: false,
                        message: err.message
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Successfully added contact'
                    });
                }
            });
        }
    }
});



module.exports = router;