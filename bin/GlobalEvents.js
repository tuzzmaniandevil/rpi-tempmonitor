const EventEmitter = require('events');

var state = {
    instance: null
}

class GlobalEvents extends EventEmitter { }

module.exports.get = function () {
    if (state.instance == null) {
        state.instance = new GlobalEvents();
    }

    return state.instance;
}