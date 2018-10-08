const express = require('express');
const router = express.Router();
const auths = require('../bin/authenticated');

const Alert = require('../schemas/alert');

/* GET home page. */
router.get('/', auths('ADMIN', 'VIEWER'), function (req, res, next) {
    Alert.getLatest((err, alerts) => {
        if (err) {
            next(err);
        } else {
            res.render('index', {
                title: 'Temp Monitor', alerts: alerts, formatDateTime: function (date) {
                    if(date){
                        return date.toLocaleDateString('en-NZ') + ' ' + date.toLocaleTimeString('en-NZ')
                    }
                    return null;
                }
            });
        }
    });
});

module.exports = router;
