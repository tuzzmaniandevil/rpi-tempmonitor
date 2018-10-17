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
    if (checkRequired(req, res, ['firstName', 'phoneNumber']) && validatePhone.validate(req, res, ['phoneNumber'])) {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let phoneNumber = req.body.phoneNumber;
        Contact.create({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber
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
            if (checkRequired(req, res, ['firstName', 'phoneNumber']) && validatePhone.validate(req, res, ['phoneNumber'])) {
                let firstName = req.body.firstName;
                let lastName = req.body.lastName;
                let phoneNumber = req.body.phoneNumber;

                contact.firstName = firstName;
                contact.lastName = lastName;
                contact.phoneNumber = phoneNumber;

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