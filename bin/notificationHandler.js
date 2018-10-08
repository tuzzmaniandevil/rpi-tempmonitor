const mongoose = require('mongoose');
const Settings = require('../schemas/settings');
const NotificationSetting = require('../schemas/notificationSetting');
const Alert = require('../schemas/alert');
const Handlebars = require('handlebars');

const clicksendManager = require('../managers/clicksendManager');

module.exports.handle = (log) => {
    return new Promise((resolve, reject) => {
        Settings.getOrCreateSettings((err, settings) => {
            if (err) {
                reject(err);
            } else {
                var sensorSetting = settings.findSensorSetting(log.deviceId);

                if (sensorSetting && sensorSetting.enabled) {
                    // Process for this sensor

                    // Check high temp
                    if (settings.highTempAlarmEnabled) {
                        if (log.temperature >= settings.highTempAlarm) {
                            // Fire high alarm!
                            console.log('Fire high alarm', log.temperature, settings.highTempAlarm);

                            handleNotification(log, settings, sensorSetting, true);
                        }
                    }
                    // Check low temp
                    else if (settings.lowTempAlarmEnabled) {
                        if (log.temperature <= settings.lowTempAlarm) {
                            // Fire Low alarm!
                            console.log('Fire low alarm');

                            handleNotification(log, settings, sensorSetting, false);
                        }
                    }
                } else {
                    resolve();
                }
            }
        });
    });
};

function handleNotification(log, settings, sensorSetting, highAlarm) {
    return new Promise((resolve, reject) => {
        let query;
        if (highAlarm) {
            query = [
                {
                    highTempSms: true
                },
                {
                    highTempVoice: true
                }
            ];
        } else {
            query = [
                {
                    lowTempSms: true
                },
                {
                    lowTempVoice: true
                }
            ]
        }

        NotificationSetting.find({
            $or: query
        }).populate('contact').find((err, notificationSettings) => {
            if (err) {
                reject(err);
            } else {
                console.log('Found notifications', notificationSettings.length);
                notificationSettings.forEach((notificationSetting) => {
                    console.log('Process notification', notificationSetting.id, notificationSetting.timeBetween);

                    // Find last Alert
                    Alert.findOne({
                        contact: mongoose.Types.ObjectId(notificationSetting.contact.id),
                    }, null, { sort: { createdAt: -1 } }, (err, alert) => {
                        if (err) {
                            return reject(err);
                        } else {
                            let isPassedTimeout = false;
                            if (!(alert == null || typeof alert == 'undefined')) {
                                let minutes = getMinutesBetweenDates(alert.createdAt, new Date());
                                isPassedTimeout = minutes >= notificationSetting.timeBetween;
                            } else {
                                isPassedTimeout = true;
                            }

                            // Timeout has passed, Send alert
                            if (isPassedTimeout) {
                                if (highAlarm) {
                                    if (notificationSetting.highTempSms) {
                                        sendSms(log, settings, notificationSetting, sensorSetting, true)
                                            .catch(err => {
                                                console.error('Error sending SMS', err);
                                            });
                                    }
                                    if (notificationSetting.highTempVoice) {
                                        sendVoice(log, settings, notificationSetting, sensorSetting, true)
                                            .catch(err => {
                                                console.error('Error sending Voice', err);
                                            });
                                    }
                                } else {
                                    if (notificationSetting.lowTempSms) {
                                        sendSms(log, settings, notificationSetting, sensorSetting, false)
                                            .catch(err => {
                                                console.error('Error sending SMS', err);
                                            });
                                    }
                                    if (notificationSetting.lowTempVoice) {
                                        sendVoice(log, settings, notificationSetting, sensorSetting, false)
                                            .catch(err => {
                                                console.error('Error sending Voice', err);
                                            });
                                    }
                                }
                            }
                        }
                    });
                });
            }
        });
    });
}

function sendSms(log, settings, notificationSetting, sensorSetting, highAlarm) {
    return new Promise((resolve, reject) => {
        generateMsg(log, notificationSetting, sensorSetting, settings.smsTemplate, highAlarm)
            .then((msg) => {
                console.log('Rendered Message', msg);

                Alert.create({
                    contact: notificationSetting.contact.id,
                    alarmType: (highAlarm ? 'HIGH' : 'LOW'),
                    msgType: 'SMS',
                    message: msg,
                    toNumber: notificationSetting.contact.mobile
                }, (err, alert) => {
                    if (err) {
                        reject(err);
                    } else {
                        alert.addStatus('Created');
                        // Send SMS :-)
                        clicksendManager.sendSms({
                            to: notificationSetting.contact.mobile,
                            body: msg
                        })
                            .then((resp => {
                                let msgRespone = resp.data.messages[0];
                                alert.messageId = msgRespone.message_id;

                                alert.addStatus(msgRespone.status);
                            }))
                            .catch(err => {
                                if (err instanceof Error) {
                                    alert.addStatus(err.message);
                                } else {
                                    try {
                                        let json = JSON.parse(err.errorResponse);
                                        alert.addStatus(json.response_msg);
                                    } catch (e) {
                                        alert.addStatus(err.errorMessage);
                                    }
                                }
                            });
                    }
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}

function sendVoice(log, settings, notificationSetting, sensorSetting, highAlarm) {
    return new Promise((resolve, reject) => {
        generateMsg(log, notificationSetting, sensorSetting, settings.voiceTemplate, highAlarm)
            .then((msg) => {
                console.log('Rendered Message', msg);

                Alert.create({
                    contact: notificationSetting.contact.id,
                    alarmType: (highAlarm ? 'HIGH' : 'LOW'),
                    msgType: 'VOICE',
                    message: msg,
                    toNumber: notificationSetting.contact.mobile
                }, (err, alert) => {
                    if (err) {
                        reject(err);
                    } else {
                        alert.addStatus('Created');

                        clicksendManager.sendVoice({
                            to: notificationSetting.contact.mobile,
                            body: msg,
                            voice: 'female'
                        }).then((resp => {
                            let msgRespone = resp.data.messages[0];
                            alert.messageId = msgRespone.message_id;

                            alert.addStatus(msgRespone.status);
                        }))
                            .catch(err => {
                                if (err instanceof Error) {
                                    alert.addStatus(err.message);
                                } else {
                                    try {
                                        let json = JSON.parse(err.errorResponse);
                                        alert.addStatus(json.response_msg);
                                    } catch (e) {
                                        alert.addStatus(err.errorMessage);
                                    }
                                }
                            });
                    }
                });
            })
            .catch(err => {
                console.log('Error rendering msg', err);
            });
    });
}

function generateMsg(log, notificationSetting, sensorSetting, template, highAlarm) {
    return new Promise((resolve, reject) => {
        let templ = template || '';

        try {
            let compiledTempl = Handlebars.compile(templ);

            let data = {
                log: log.toJSON(),
                contact: notificationSetting.contact.toJSON(),
                sensor: sensorSetting.toJSON(),
                alarmType: (highAlarm ? 'HIGH' : 'LOW')
            };

            let msg = compiledTempl(data);
            resolve(msg);
        } catch (e) {
            reject(e);
        }
    });
}

function getMinutesBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
}