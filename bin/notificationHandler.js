var Settings = require('../schemas/settings');

module.exports.handle = (log) => {
    return new Promise((resolve, reject) => {
        Settings.getOrCreateSettings((err, settings) => {
            if (err) {
                reject(err);
            } else {
                var sensorSetting = settings.findSensorSetting(log.deviceId);
                resolve();
            }
        });
    });
};