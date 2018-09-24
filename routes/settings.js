var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');
var Settings = require('../schemas/settings');
var checkRequired = require('../bin/requiredFields');
var createError = require('http-errors');

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

module.exports = router;