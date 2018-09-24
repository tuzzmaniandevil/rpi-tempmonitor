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
    TemperatureLogSchema.findOne({ deviceId: sensorid }, {}, { sort: { 'updatedAt': -1 } }, (err, log) => {
        return callback(err, log);
    });
};

const TemperatureLog = mongoose.model('TemperatureLog', TemperatureLogSchema);

module.exports = TemperatureLog;