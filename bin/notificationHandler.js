const Settings = require('../schemas/settings');
const NotificationSetting = require('../schemas/notificationSetting');
const Alert = require('../schemas/alert');

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