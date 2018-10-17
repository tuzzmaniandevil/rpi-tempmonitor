const mongoose = require('mongoose');
const util = require('util');
const NotificationSetting = require('./notificationSetting');

const ContactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: false,
        trim: true
    }
}, {
        timestamps: true
    });

ContactSchema.pre('remove', { document: true, query: true }, function (next) {
    var _self = this;

    // Remove any related notifications
    NotificationSetting.remove({
        contact: mongoose.Types.ObjectId(_self.id)
    }, (err) => {
        if (err) {
            next(err);
        } else {
            next();
        }
    });
});

ContactSchema.methods.formattedName = function () {
    var _self = this;

    if (_self.firstName && _self.firstName.trim().length > 0) {
        return util.format('%s %s', _self.firstName, _self.lastName).trim();
    } else {
        return _self._id;
    }
};

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;