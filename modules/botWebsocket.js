const { webServer, webServerPort, webServerPassword } = require('../config')
const io = require('socket.io-client')
const config = require('../config')
const botconfig = require('./botConfig')
let socket; let friends = []; let masters = []; let loged = false

function connect (botUsername) {
  socket = io(webServer + ':' + webServerPort)
  socket.on('connect', () => {
    console.log('Connected to webserver')
    socket.emit('login', webServerPassword)
  })

  socket.on('login', (authenticate) => {
    if (authenticate.auth) {
      loged = true
      socket.emit('addFriend', botUsername)
    } else {
      loged = false
    }
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

  socket.on('changeConfig', (config) => {
    let itemsToBeReady, patrol, index, temp
    switch (config.configToChange) {
      case 'job':
        botconfig.setJob(botUsername, config.value)
        break
      case 'pickUpItems':
        botconfig.setPickUpItems(botUsername, config.value)
        break
      case 'helpFriend':
        botconfig.setHelpFriend(botUsername, config.value)
        break
      case 'mode':
        botconfig.setMode(botUsername, config.value)
        break
      case 'distance':
        botconfig.setDistance(botUsername, config.value)
        break
      case 'InsertItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(botUsername)
        itemsToBeReady.push({
          item: config.value.item,
          quantity: config.value.quantity
        })
        botconfig.setItemsToBeReady(botUsername, itemsToBeReady)
        break
      case 'DeleteItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(botUsername)
        itemsToBeReady.splice(config.value, 1)
        botconfig.setItemsToBeReady(botUsername, itemsToBeReady)
        break
      case 'addPatrol':
        patrol = botconfig.getPatrol(botUsername)
        patrol.push(config.value)
        botconfig.setPatrol(botUsername, patrol)
        break
      case 'removePatrol':
        patrol = botconfig.getPatrol(botUsername)
        patrol.splice(config.value, 1)
        botconfig.setPatrol(botUsername, patrol)
        break
      case 'movePatrolNext':
        patrol = botconfig.getPatrol(botUsername)
        index = config.value
        if (patrol.length > (index + 1)) {
          temp = patrol[index]
          patrol[index] = patrol[index + 1]
          patrol[index + 1] = temp
          botconfig.setPatrol(botUsername, patrol)
        }
        break
      case 'movePatrolPrev':
        patrol = botconfig.getPatrol(botUsername)
        index = config.value
        if (index > 0) {
          temp = patrol[index]
          patrol[index] = patrol[index - 1]
          patrol[index - 1] = temp
          botconfig.setPatrol(botUsername, patrol)
        }
        break
    }

    sendConfig(botUsername, config.fromSocketId)
  })

  socket.on('getConfig', (fromSocketId) => {
    sendConfig(botUsername, fromSocketId)
  })
}

function sendConfig (botUsername, toSocketId) {
  socket.emit('sendAction', {
    action: 'sendConfig',
    socketId: toSocketId,
    value: botconfig.getAll(botUsername)
  })
}

function emit (chanel, data) {
  if (!loged) { return }
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
  if (!loged) { return }
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
