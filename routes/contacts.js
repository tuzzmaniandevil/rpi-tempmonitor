const express = require('express');
const router = express.Router();
const auths = require('../bin/authenticated');
const Contact = require('../schemas/contact');
const checkRequired = require('../bin/requiredFields');
const validatePhone = require('../bin/validatePhoneNum');

/* GET Contacts */
router.get('/', auths('ADMIN'), (req, res, next) => {
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
router.post('/', auths('ADMIN'), (req, res, next) => {
    if (checkRequired(req, res, ['firstName']) && validatePhone.validate(req, res, ['mobile', 'landline'])) {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let mobile = req.body.mobile;
        let landline = req.body.landline;

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

/* GET contact */
router.get('/:contactid', auths('ADMIN'), (req, res, next) => {
    var cid = req.params.contactid;

    Contact.findById(cid, (err, contact) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            res.json({
                status: true,
                message: 'Success',
                data: contact.toJSON({ virtuals: true })
            });
        }
    });
});

/* POST contact */
router.post('/:contactid', auths('ADMIN'), (req, res, next) => {
    var cid = req.params.contactid;

    Contact.findById(cid, (err, contact) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            if (checkRequired(req, res, ['firstName']) && validatePhone.validate(req, res, ['mobile', 'landline'])) {
                let firstName = req.body.firstName;
                let lastName = req.body.lastName;
                let mobile = req.body.mobile;
                let landline = req.body.landline;

                if (!(mobile && mobile.trim().length > 0) && !(landline && landline.trim().length > 0)) {
                    res.json({
                        status: false,
                        message: 'Please specify a mobile and/or landline number',
                        fields: ['mobile', 'landline']
                    });
                } else {
                    contact.firstName = firstName;
                    contact.lastName = lastName;
                    contact.mobile = mobile;
                    contact.landline = landline;

                    contact.save((err) => {
                        if (err) {
                            res.json({
                                status: false,
                                message: err.message
                            });
                        } else {
                            res.json({
                                status: true,
                                message: 'Successfully updated contact'
                            });
                        }
                    });
                }
            }
        }
    });
});

/* DELETE contact */
router.delete('/:contactid', auths('ADMIN'), (req, res, next) => {
    var cid = req.params.contactid;

    Contact.findById(cid, (err, contact) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            contact.remove((err) => {
                if (err) {
                    res.json({
                        status: false,
                        message: err.message
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Successfully deleted contact'
                    });
                }
            });
        }
    });
});

module.exports = router;