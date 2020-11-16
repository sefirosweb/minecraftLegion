const { webServer, webServerPort } = require('../config')
const io = require('socket.io-client')
const config = require('../config')
const botconfig = require('./botConfig')
let socket; let friends = []; let masters = []

function connect (botUsername) {
  socket = io(webServer + ':' + webServerPort)
  socket.on('connect', () => {
    console.log('Connected to webserver')
    socket.emit('addFriend', botUsername)
  })

  socket.on('disconnect', () => {
    console.log('Disconected from webserver')
  })

  socket.on('sendDisconnect', () => {
    process.exit(1)
  })

  socket.on('botsOnline', (botsOnline) => {
    friends = botsOnline
  })

  socket.on('botStatus', data => {
    const botIndex = friends.findIndex(e => e.socketId === data.socketId)
    if (botIndex >= 0) {
      const friendUpdate = [
        ...friends
      ]
      friendUpdate[botIndex][data.type] = data.value
      friends = friendUpdate
    }
  })

  socket.on('mastersOnline', (mastersOnline) => {
    masters = mastersOnline
  })

  socket.on('getConfig', (data) => {
    const action = {
      action: 'sendConfig',
      value: botconfig.getAll(botUsername)
    }
    console.log(action)
    socket.emit('sendAction', action)
  })
}

function emit (chanel, data) {
  socket.emit(chanel, data)
}

function emitHealth (health) {
  const data = {
    type: 'health',
    value: health
  }
  emit('botStatus', data)
}

function emitCombat (combat) {
  const data = {
    type: 'combat',
    value: combat
  }
  emit('botStatus', data)
}

function emitFood (health) {
  const data = {
    type: 'food',
    value: health
  }
  emit('botStatus', data)
}

function log (data) {
  socket.emit('logs', data)
}

function on (listener, cb) {
  socket.on(listener, cb)
}

function getFriends () {
  return friends
}

function getMasters () {
  const allMasters = masters.concat(config.masters) // Gef offline + online config
  return allMasters
}

module.exports = {
  connect,
  on,
  emit,
  log,
  emitHealth,
  emitFood,
  emitCombat,
  getFriends,
  getMasters
}
