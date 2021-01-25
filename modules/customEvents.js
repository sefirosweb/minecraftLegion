const events = require('events')

const eventsToListen = new events.EventEmitter()

function getEventsToListen () {
  return eventsToListen
}

function executePhysicTickEvents () {
  eventsToListen.emit('physicTick')
}

function executeChatEvents (username, message) {
  eventsToListen.emit('chat', username, message)
}
function executeMoveEvents (position) {
  eventsToListen.emit('move', position)
}

function addEvent (event, cb) {
  eventsToListen.on(event, cb)
}

function removeListener (event, cb) {
  eventsToListen.removeListener(event, cb)
}

function removeAllListeners (event) {
  eventsToListen.removeAllListeners(event)
}

function rawListeners (event) {
  return eventsToListen.rawListeners(event)
}

function listenerCount (event) {
  return eventsToListen.listenerCount(event)
}

function listeners (event) {
  return eventsToListen.listeners(event)
}

module.exports = {
  getEventsToListen,
  addEvent,
  executePhysicTickEvents,
  executeChatEvents,
  executeMoveEvents,
  removeListener,
  removeAllListeners,
  rawListeners,
  listenerCount,
  listeners
}
