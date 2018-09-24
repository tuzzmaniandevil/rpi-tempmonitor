const mongoose = require('mongoose');
const util = require('util');

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
        unique: true,
        required: false,
        trim: true
    },
    mobile: {
        type: String,
        unique: true,
        required: false,
        trim: true
    },
    landline: {
        type: String,
        unique: true,
        required: false,
        trim: true
    }
}, {
        timestamps: true
    });

ContactSchema.methods.formattedName = function () {
    var _self = this;

    if (_self.firstName && _self.firstName.trim()) {
        return util.format('%s %s', _self.firstName, _self.lastName).trim();
    } else {
        return _self._id;
    }
};

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;