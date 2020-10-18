var events = require('events');

const eventsToListen = new events.EventEmitter();

function executePhysicTickEvents() {
    eventsToListen.emit('physicTick');
}

function executeChatEvents(username, message) {
    eventsToListen.emit('chat', username, message);
}
function executeMoveEvents(position) {
    eventsToListen.emit('move', position);
}

function addEvent(event, cb) {
    eventsToListen.on(event, cb)
}

function removeListener(event, cb) {
    eventsToListen.removeListener(event, cb)
}

function removeAllListeners(event) {
    eventsToListen.removeAllListeners(event)
}

function rawListeners(event) {
    return eventsToListen.rawListeners(event)
}

function listenerCount() {
    return eventsToListen.listenerCount(event)
}

module.exports = {
    addEvent,
    executePhysicTickEvents,
    executeChatEvents,
    executeMoveEvents,
    removeListener,
    removeAllListeners,
    rawListeners,
    listenerCount
}
