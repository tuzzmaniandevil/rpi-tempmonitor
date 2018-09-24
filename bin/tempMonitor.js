var events = require('events');
const W1Temp = require('w1temp');
const nodeEnv = process.env.NODE_ENV || 'dev';

function tempSensors() {
    this._sensors = [];
    this._callbacks = [];

    events.EventEmitter.call(this);
}

tempSensors.prototype.__proto__ = events.EventEmitter.prototype;

tempSensors.prototype.getSensorsUids = function (masterBusId) {
    return W1Temp.getSensorsUids(masterBusId);
};

tempSensors.prototype.start = function () {
    var self = this;

    if (nodeEnv == 'dev') {
        return new Promise((resolve, reject) => {
            try {
                let gpioMock = require('gpio-mock');

                // Hardware definition for DS18B20;
                let f = {
                    "behavior": "function",
                    "temperature": function () {
                        return Math.random() * 100000;
                    }
                };

                gpioMock.start(function (err) {
                    gpioMock.addMockHardwareModule('ds18b20', 'ds18b20-gpio-mock', function (err) {
                        if (!err) {
                            gpioMock.addMockHardware('ds18b20', '28-800000263717', f, function (err) {
                                if (err) {
                                    console.warn('Error adding mock hardware', err);
                                    reject(err);
                                } else {
                                    W1Temp.getSensor('28-800000263717').then((sensor) => {
                                        sensor.on('change', (temp) => {
                                            self.emit('change', '28-800000263717', temp);
                                        });
                                        resolve();
                                    }).catch(err => {
                                        reject(err);
                                    });
                                }
                            });
                        } else {
                            console.warn('Error adding mock hardware', err);
                            reject(err);
                        }
                    });
                });
            } catch (e) {
                console.warn('Unable to load ds18b20-gpio-mock', e);
                reject(e);
            }
        });
    } else {
        return new Promise((resolve, reject) => {
            self.getSensorsUids.call(this).then(ids => {
                console.log('Got %d sensors', ids.length);

                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];

                    W1Temp.getSensor(id).then((sensor) => {
                        sensor.on('change', (temp) => {
                            self.emit('change', id, temp);
                        });
                    }).catch(err => {
                        reject(err);
                    });

                    resolve();
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
};

module.exports = tempSensors;