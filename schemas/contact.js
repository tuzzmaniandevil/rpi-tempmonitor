const mongoose = require('mongoose');

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
        required: true,
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

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;