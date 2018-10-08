const globalEvents = require('../bin/GlobalEvents').get();


module.exports.start = (io) => {
    globalEvents.on('socketioBroadcast', (channel, data) => {
        io.sockets.emit(channel, data);
    });
}