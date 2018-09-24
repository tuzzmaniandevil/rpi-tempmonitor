const mongoose = require('mongoose');

const TemperatureLogSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    deviceId: {
        type: String,
        required: true,
        trim: true
    }
}, {
        timestamps: true
    });

TemperatureLogSchema.statics.findLatestByDevice = (sensorid, callback) => {
    return TemperatureLog.findOne({ deviceId: sensorid }, {}, { sort: { 'updatedAt': -1 } }, (err, log) => {
        return callback(err, log);
    });
};

TemperatureLogSchema.statics.findHistoryByDevice = (sensorid, callback) => {
    return TemperatureLog.find({ deviceId: sensorid }, (err, logs) => {
        return callback(err, logs);
    })
};

const TemperatureLog = mongoose.model('TemperatureLog', TemperatureLogSchema);

module.exports = TemperatureLog;