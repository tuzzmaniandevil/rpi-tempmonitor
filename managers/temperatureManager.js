const globalEvents = require('../bin/GlobalEvents').get();

const Settings = require('../schemas/settings');
const TemperatureLog = require('../schemas/temperature');
const notificationHandler = require('../bin/notificationHandler');

module.exports.start = () => {
    globalEvents.on('tempChange', (id, temp) => {
        console.log('Temp Changed!', id, temp);

        // Get Settings Object
        Settings.getOrCreateSettings((err, settings) => {
            if (err) {
                console.error('Error starting temperature sensor', err);
                process.exit(1)
            } else {
                // Get Sensor settings
                var sensorSetting = settings.findSensorSetting(id);
                if (sensorSetting && sensorSetting.enabled) {
                    // Log temperature into DB
                    TemperatureLog.create({
                        temperature: temp,
                        deviceId: id
                    }, (err, tempLog) => {
                        if (err) {
                            console.error('Error storing TemperatureLog', err);
                        } else {
                            // Send to notification handler
                            notificationHandler.handle(tempLog)
                                .catch(err => {
                                    console.error('Error processing notification', err);
                                });

                            // Emit change to websockets
                            globalEvents.emit('socketioBroadcast', 'temperature', {
                                id: id,
                                name: sensorSetting.name || id,
                                temperature: temp
                            });
                        }
                    });
                }
            }
        });
    });
};