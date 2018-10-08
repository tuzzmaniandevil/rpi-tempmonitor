const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    contact: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'Contact'
    },
    alarmType: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    msgType: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    messageId: String,
    toNumber: String,
    message: {
        type: String,
        required: true,
        trim: true
    },
    statuses: [{
        status: {
            type: String,
            required: true,
            trim: true
        },
        statusDate: {
            type: Date,
            required: true
        }
    }]
}, {
        timestamps: true
    });

AlertSchema.methods.getLatestStatus = function () {
    var _self = this;

    if (_self.statuses && _self.statuses.length) {
        return _self.statuses.reduce((m, v, i) => (v.statusDate > m.statusDate) && i ? v : m);
    }

    return null;
}

AlertSchema.methods.addStatus = function (status) {
    var _self = this;

    return new Promise((resolve, reject) => {
        if (!_self.statuses) {
            _self.statuses = [];
        }

        _self.statuses.push({
            status: status,
            statusDate: new Date()
        });

        _self.save((err, updatedAlert) => {
            if (err) {
                reject(err);
            } else {
                resolve(updatedAlert);
            }
        });
    });
}

AlertSchema.statics.getLatest = function (cb) {
    Alert.find({}, {}, { sort: { 'updatedAt': -1 } }).limit(10).find((err, alerts) => {
        cb(err, alerts);
    });
};

const Alert = mongoose.model('Alert', AlertSchema);

module.exports = Alert;