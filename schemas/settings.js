const mongoose = require('mongoose');

const defaultSettings = {};

const SettingsSchema = new mongoose.Schema({
    clicksendUsername: {
        type: String,
        trim: true
    },
    clicksendKey: {
        type: String,
        trim: true
    },
    highTempAlarm: {
        type: Number
    },
    highTempAlarmEnabled: {
        type: Boolean,
        default: false
    },
    lowTempAlarm: {
        type: Number
    },
    lowTempAlarmEnabled: {
        type: Boolean,
        default: false
    },
    smsTemplate: {
        type: String,
        trim: true
    },
    voiceTemplate: {
        type: String,
        trim: true
    },
    sensors: [{
        id: String,
        name: String,
        enabled: Boolean
    }]
});

SettingsSchema.methods.findSensorSetting = function (sensorid) {
    var self = this;
    if (self.sensors && self.sensors.length > 0) {
        for (let i = 0; i < self.sensors.length; i++) {
            const sensor = self.sensors[i];
            if (sensor.id == sensorid) {
                return sensor;
            }
        }
    }

    return null;
}

SettingsSchema.statics.getOrCreateSettings = function (cb) {
    Settings.findOne({})
        .exec(function (err, settings) {
            if (err) {
                cb(err);
            } else {
                if (settings) {
                    cb(null, settings);
                } else {
                    Settings.create({}, function (err, newSettings) {
                        cb(err, newSettings);
                    });
                }
            }
        });
};


const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;