const express = require('express');
const router = express.Router();
const auths = require('../bin/authenticated');
const Contact = require('../schemas/contact');
const checkRequired = require('../bin/requiredFields');
const validatePhone = require('../bin/validatePhoneNum');

/* GET Contacts */
router.get('/', auths('ADMIN'), function (req, res, next) {
    Contact.find({}, function (err, contacts) {
        if (err) {
            next(err);
        } else {
            res.render('contacts', { title: 'Contacts', contacts: contacts, supportedCountries: validatePhone.supportedCountries() });
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