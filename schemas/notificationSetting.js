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
    },
    timeBetween: {
        type: Number,
        default: 5
    }
}, {
        timestamps: true
    });

NotificationSettingSchema.virtual('highNotification')
    .get(function () {
        var _self = this;
        console.log('Get', _self);
        if (_self.highTempSms && _self.highTempVoice) {
            return 'SMS_VOICE';
        } else if (_self.highTempSms && !_self.highTempVoice) {
            return 'SMS';
        } else if (!_self.highTempSms && _self.highTempVoice) {
            return 'VOICE';
        } else {
            return 'NONE';
        }
    })
    .set(function (v) {
        switch (v) {
            case 'SMS': {
                this.highTempSms = true;
                this.highTempVoice = false;
                break;
            }
            case 'VOICE': {
                this.highTempSms = false;
                this.highTempVoice = true;
                break;
            }
            case 'SMS_VOICE': {
                this.highTempSms = true;
                this.highTempVoice = true;
                break;
            }
            default: {
                this.highTempSms = false;
                this.highTempVoice = false;
            }
        }
    });

NotificationSettingSchema.virtual('lowNotification')
    .get(function () {
        if (this.lowTempSms && this.lowTempVoice) {
            return 'SMS_VOICE';
        } else if (this.lowTempSms && !this.lowTempVoice) {
            return 'SMS';
        } else if (!this.lowTempSms && this.lowTempVoice) {
            return 'VOICE';
        } else {
            return 'NONE';
        }
    })
    .set(function (v) {
        switch (v) {
            case 'SMS': {
                this.lowTempSms = true;
                this.lowTempVoice = false;
                break;
            }
            case 'VOICE': {
                this.lowTempSms = false;
                this.lowTempVoice = true;
                break;
            }
            case 'SMS_VOICE': {
                this.lowTempSms = true;
                this.lowTempVoice = true;
                break;
            }
            default: {
                this.lowTempSms = false;
                this.lowTempVoice = false;
            }
        }
    });

const NotificationSetting = mongoose.model('NotificationSetting', NotificationSettingSchema);

module.exports = NotificationSetting;