var events = require('events');

const eventsToListen = new events.EventEmitter();

function executeEvents() {
    eventsToListen.emit('event');
}

function addEvent(cb) {
    eventsToListen.on('event', cb)
}

function removeListener(cb) {
    eventsToListen.removeListener('event', cb)
}

function removeAllListeners() {
    eventsToListen.removeAllListeners('event')
}

function rawListeners() {
    return eventsToListen.rawListeners('event')
}

function listenerCount() {
    return eventsToListen.listenerCount('event')
}

module.exports = {
    addEvent,
    executeEvents,
    removeListener,
    removeAllListeners,
    rawListeners,
    listenerCount
}
