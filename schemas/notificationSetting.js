const mongoose = require('mongoose');

const NotificationSettingSchema = new mongoose.Schema({
    contact: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'Contact'
    },
    highTempSms: {
        type: Boolean,
        default: false
    },
    highTempVoice: {
        type: Boolean,
        default: false
    },
    lowTempSms: {
        type: Boolean,
        default: false
    },
    lowTempVoice: {
        type: Boolean,
        default: false
    }
}, {
        timestamps: true
    });

const NotificationSetting = mongoose.model('NotificationSetting', NotificationSettingSchema);

module.exports = NotificationSetting;