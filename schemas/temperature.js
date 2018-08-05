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

const TemperatureLog = mongoose.model('TemperatureLog', TemperatureLogSchema);

module.exports = TemperatureLog;