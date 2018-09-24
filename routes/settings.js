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
                        if (configSensor == sensorId) {
                            sensor.name = configSensor.id
                            sensor.enabled = configSensor.enabled
                        }
                    });

                    sensors.push(sensor);
                });

                sensors.sort((a, b) => {
                    return (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0;
                })
            }

            res.render('settings', { title: 'Settings', settings: settings, sensors: sensors });
        }
    });
});

module.exports = router;