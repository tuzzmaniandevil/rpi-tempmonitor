const express = require('express');
const router = express.Router();
const auths = require('../bin/authenticated');
const Settings = require('../schemas/settings');
const Contact = require('../schemas/contact');
const checkRequired = require('../bin/requiredFields');

/* GET settings */
router.get('/', auths('ADMIN'), (req, res, next) => {
    Settings.getOrCreateSettings((err, settings) => {
        if (err) {
            next(err);
        } else {
            // Get Sensors
            var sensors = [];
            if (req.app.locals.sensors && req.app.locals.sensors.length > 0) {
                var configuredSensors = settings.sensors || [];

                req.app.locals.sensors.forEach(sensorId => {
                    var sensor = {
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
                    res.render('settings', { title: 'Settings', settings: settings, sensors: sensors, contacts: contacts });
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
                var sensorid = req.body.sensorid;
                var name = req.body.name;
                var enabled = req.body.enabled.toLowerCase() == 'true';

                var sensors = settings.sensors || [];
                var found = false;

                sensors.forEach(sensor => {
                    if (sensor.id == sensorid) {
                        found = true;

                        sensor.name = name;
                        sensor.enabled = enabled;

                        return;
                    }
                });

                if (!found) {
                    var sensor = {
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
            var clicksendUsername = req.body.clicksendUsername;
            var clicksendKey = req.body.clicksendKey;

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
            var highTempAlarmEnabled = req.body.highTempAlarmEnabled == 'true';
            var highTempAlarm = req.body.highTempAlarm;

            var lowTempAlarmEnabled = req.body.lowTempAlarmEnabled == 'true';
            var lowTempAlarm = req.body.lowTempAlarm;

            var requiredFields = [];

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
            next(err);
        } else {
            var smsTemplate = req.body.smsTemplate;
            var voiceTemplate = req.body.voiceTemplate;

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

module.exports = router;