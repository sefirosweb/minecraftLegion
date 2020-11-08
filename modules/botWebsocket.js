const { webServer, webServerPort } = require('../config')
const io = require('socket.io-client')
let socket, friends, masters

function connect (botUsername) {
  socket = io(webServer + ':' + webServerPort)
  socket.on('connect', () => {
    console.log('Connected to webserver')
    socket.emit('addFriend', botUsername)
    // socket.emit('getBotsOnline', botUsername)
  })

  socket.on('disconnect', () => {
    console.log('Disconected from webserver')
  })

  socket.on('sendDisconnect', () => {
    process.exit(1)
  })

  socket.on('botsOnline', (botsOnline) => {
    // console.log(botsOnline)
    friends = botsOnline
  })

  socket.on('botStatus', data => {
    const index = friends.findIndex(e => e.socketId === data.socketId)
    if (index < 0) {
      return
    }
    const friendUpdate = [
      ...friends
    ]
    friendUpdate[index][data.type] = data.value

    friends = friendUpdate
  })

  socket.on('mastersOnline', (mastersOnline) => {
    // console.log('mastersOnline', mastersOnline)
    masters = mastersOnline
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
  return masters
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
