const globalEvents = require('../bin/GlobalEvents').get();
const Settings = require('../schemas/settings');

const Clicksend = require('clicksend');
const SMSController = Clicksend.SMSController;
const SmsMessageCollection = Clicksend.SmsMessageCollection;
const SmsMessage = Clicksend.SmsMessage;

const VoiceController = Clicksend.VoiceController;
const VoiceMessage = Clicksend.VoiceMessage;
const VoiceMessageCollection = Clicksend.VoiceMessageCollection;

// Send SMS
module.exports.sendSms = (message) => {
    return new Promise((resolve, reject) => {
        Settings.getOrCreateSettings((err, settings) => {
            if (err) {
                console.error('Error getting settings', err);
                reject(err);
            } else {
                let clicksendUsername = settings.clicksendUsername;
                let clicksendKey = settings.clicksendKey;

                Clicksend.Configuration.username = clicksendUsername;
                Clicksend.Configuration.key = clicksendKey;

                let smsCollection = new SmsMessageCollection({
                    messages: [
                        new SmsMessage(message)
                    ]
                });

                SMSController.sendSms(smsCollection)
                    .then((resp) => {
                        console.log('SMS Message sent');
                        resolve(JSON.parse(resp));
                    })
                    .catch((err) => {
                        console.error('Error sending SMS', err);
                        reject(err);
                    });
            }
        });
    });
};

module.exports.sendVoice = (message) => {
    return new Promise((resolve, reject) => {
        Settings.getOrCreateSettings((err, settings) => {
            if (err) {
                console.error('Error getting settings', err);
                reject(err);
            } else {
                let clicksendUsername = settings.clicksendUsername;
                let clicksendKey = settings.clicksendKey;

                Clicksend.Configuration.username = clicksendUsername;
                Clicksend.Configuration.key = clicksendKey;

                let voiceCollection = new VoiceMessageCollection({
                    messages: [
                        new VoiceMessage(message)
                    ]
                });

                VoiceController.sendVoice(voiceCollection)
                    .then((resp) => {
                        console.log('Voice Message sent');
                        resolve(JSON.parse(resp));
                    })
                    .catch((err) => {
                        console.error('Error sending Voice', err);
                        reject(err);
                    });
            }
        });
    });
};