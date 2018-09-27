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
        timestamps: true,
        capped: {
            size: 2147483648 // 2 GB
        }
    });

TemperatureLogSchema.statics.findLatestByDevice = (sensorid, callback) => {
    return TemperatureLog.findOne({ deviceId: sensorid }, {}, { sort: { 'updatedAt': -1 } }, (err, log) => {
        return callback(err, log);
    });
};

TemperatureLogSchema.statics.findHistoryByDevice = (sensorid, max, callback) => {
    return TemperatureLog.find({ deviceId: sensorid }).limit(max).find((err, logs) => {
        return callback(err, logs);
    })
};

const TemperatureLog = mongoose.model('TemperatureLog', TemperatureLogSchema);

module.exports = TemperatureLog;