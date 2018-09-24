const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({

}, {
        timestamps: true
    });

const Alert = mongoose.model('Alert', AlertSchema);

module.exports = Alert;