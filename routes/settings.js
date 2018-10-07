const express = require('express');
const router = express.Router();
const auths = require('../bin/authenticated');
const Settings = require('../schemas/settings');
const Contact = require('../schemas/contact');
const NotificationSetting = require('../schemas/notificationSetting');
const checkRequired = require('../bin/requiredFields');

/* GET settings */
router.get('/', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            // Get Sensors
            let sensors = [];
            if (req.app.locals.sensors && req.app.locals.sensors.length > 0) {
                let configuredSensors = settings.sensors || [];

                req.app.locals.sensors.forEach(sensorId => {
                    let sensor = {
                        id: sensorId,
                        name: null,
                        enabled: false
                    };

                    configuredSensors.forEach(configSensor => {
                        if (configSensor.id == sensorId) {
                            sensor.name = configSensor.name
                            sensor.enabled = configSensor.enabled
                        }
                    });

                    sensors.push(sensor);
                });

                sensors.sort((a, b) => {
                    return (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0;
                })
            }

            Contact.find({}, (err, contacts) => {
                if (err) {
                    next(err);
                } else {
                    NotificationSetting.find({}).populate('contact').find((nErr, notificationSettings) => {
                        if (nErr) {
                            next(nErr);
                        } else {
                            res.render('settings', {
                                title: 'Settings',
                                settings: settings,
                                sensors: sensors,
                                contacts: contacts,
                                notificationSettings: notificationSettings
                            });
                        }
                    });
                }
            });
        }
    });
});

/* POST sensor settings */
router.post('/sensors', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            if (checkRequired(req, res, ['sensorid', 'name', 'enabled'])) {
                let sensorid = req.body.sensorid;
                let name = req.body.name;
                let enabled = req.body.enabled.toLowerCase() == 'true';

                let sensors = settings.sensors || [];
                let found = false;

                sensors.forEach(sensor => {
                    if (sensor.id == sensorid) {
                        found = true;

                        sensor.name = name;
                        sensor.enabled = enabled;

                        return;
                    }
                });

                if (!found) {
                    let sensor = {
                        id: sensorid,
                        name: name,
                        enabled: enabled
                    };

                    sensors.push(sensor);
                }

                settings.sensors = sensors;

                settings.save((err, updatedSettings) => {
                    if (err) {
                        res.json({
                            status: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            status: true,
                            message: 'Successfully updated sensor'
                        });
                    }
                });
            }
        }
    });
});

/* POST Clicksend settings */
router.post('/clicksend', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            let clicksendUsername = req.body.clicksendUsername;
            let clicksendKey = req.body.clicksendKey;

            settings.clicksendUsername = clicksendUsername;
            settings.clicksendKey = clicksendKey;

            settings.save((err, updatedSettings) => {
                if (err) {
                    res.json({
                        status: false,
                        message: err.message
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Successfully updated Clicksend'
                    });
                }
            });
        }
    });
});

/* POST Temperature Setpoints settings */
router.post('/tempSetpoints', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            let highTempAlarmEnabled = req.body.highTempAlarmEnabled == 'true';
            let highTempAlarm = req.body.highTempAlarm;

            let lowTempAlarmEnabled = req.body.lowTempAlarmEnabled == 'true';
            let lowTempAlarm = req.body.lowTempAlarm;

            let requiredFields = [];

            if (highTempAlarmEnabled) {
                requiredFields.push('highTempAlarm');
            }
            if (lowTempAlarmEnabled) {
                requiredFields.push('lowTempAlarm');
            }

            if (checkRequired(req, res, requiredFields)) {
                settings.highTempAlarmEnabled = highTempAlarmEnabled;
                if (highTempAlarmEnabled) {
                    settings.highTempAlarm = highTempAlarm;
                }

                settings.lowTempAlarmEnabled = lowTempAlarmEnabled;
                if (lowTempAlarmEnabled) {
                    settings.lowTempAlarm = lowTempAlarm;
                }

                settings.save((err, updatedSettings) => {
                    if (err) {
                        res.json({
                            status: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            status: true,
                            message: 'Successfully updated Temperature Setpoints'
                        });
                    }
                });
            }
        }
    });
});

/* POST Message Templates */
router.post('/messageTemplates', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            let smsTemplate = req.body.smsTemplate;
            let voiceTemplate = req.body.voiceTemplate;

            settings.smsTemplate = smsTemplate;
            settings.voiceTemplate = voiceTemplate;

            settings.save((err, updatedSettings) => {
                if (err) {
                    res.json({
                        status: false,
                        message: err.message
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Successfully updated Message Templates'
                    });
                }
            });
        }
    });
});

/* POST notification settings */
router.post('/notifications', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            if (checkRequired(req, res, ['contact', 'highNotification', 'lowNotification', 'timeBetween'])) {
                let contact = req.body.contact;
                let highNotification = req.body.highNotification;
                let lowNotification = req.body.lowNotification;
                let timeBetween = req.body.timeBetween;

                NotificationSetting.create({
                    contact: contact,
                    highNotification: highNotification,
                    lowNotification: lowNotification,
                    timeBetween: timeBetween
                }, (err, newNotification) => {
                    if (err) {
                        res.json({
                            status: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            status: true,
                            message: 'Successfully added notification'
                        });
                    }
                });
            }
        }
    });
});

/* GET notification setting */
router.get('/notifications/:notificationid', auths('ADMIN'), (req, res, next) => {
    var nid = req.params.notificationid;

    NotificationSetting.findById(nid, (err, nis) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            res.json({
                status: true,
                message: 'Success',
                data: nis.toJSON({ virtuals: true })
            });
        }
    });
});

/* POST notification setting */
router.post('/notifications/:notificationid', auths('ADMIN'), (req, res, next) => {
    var nid = req.params.notificationid;

    NotificationSetting.findById(nid, (err, nis) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            if (checkRequired(req, res, ['contact', 'highNotification', 'lowNotification', 'timeBetween'])) {
                let contact = req.body.contact;
                let highNotification = req.body.highNotification;
                let lowNotification = req.body.lowNotification;
                let timeBetween = req.body.timeBetween;

                nis.contact = contact;
                nis.highNotification = highNotification;
                nis.lowNotification = lowNotification;
                nis.timeBetween = timeBetween;

                nis.save((err, updatedNis) => {
                    if (err) {
                        res.json({
                            status: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            status: true,
                            message: 'Successfully updated'
                        });
                    }
                });
            }
        }
    });
});

/* DELETE notification setting */
router.delete('/notifications/:notificationid', auths('ADMIN'), (req, res, next) => {
    var nid = req.params.notificationid;

    NotificationSetting.findById(nid, (err, nis) => {
        if (err) {
            res.json({
                status: false,
                message: err.message
            });
        } else {
            nis.remove((err2) => {
                if (err2) {
                    res.json({
                        status: false,
                        message: err2.message
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Successfully deleted notification'
                    });
                }
            });
        }
    });
});

module.exports = router;