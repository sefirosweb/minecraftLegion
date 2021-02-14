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
    let itemsToBeReady, patrol, index, temp, minerConfig, chests, itemsCanBeEat
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
      case 'InsertItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(botUsername)
        itemsCanBeEat.push(config.value.item)
        botconfig.setItemsCanBeEat(botUsername, itemsCanBeEat)
        break
      case 'DeleteItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(botUsername)
        itemsCanBeEat.splice(config.value, 1)
        botconfig.setItemsCanBeEat(botUsername, itemsCanBeEat)
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
      case 'changeTunnel':
        minerConfig = botconfig.getMinerCords(botUsername)
        minerConfig.tunel = config.value
        botconfig.setMinerCords(botUsername, minerConfig)
        break
      case 'changeOrientation':
        minerConfig = botconfig.getMinerCords(botUsername)
        minerConfig.orientation = config.value
        botconfig.setMinerCords(botUsername, minerConfig)
        break
      case 'changePosMiner':
        minerConfig = botconfig.getMinerCords(botUsername)
        minerConfig[config.value.coord] = config.value.pos
        botconfig.setMinerCords(botUsername, minerConfig)
        break
      case 'insertNewChest':
        chests = botconfig.getChests(botUsername)
        console.log(chests)
        chests.push({
          name: 'Input chest name',
          type: 'withdraw', // deposit,
          position: {
            x: null,
            y: null,
            z: null
          },
          items: []
        })
        console.log(chests)
        botconfig.setChests(botUsername, chests)
        break
      case 'deleteChest':
        chests = botconfig.getChests(botUsername)
        chests.splice(config.value, 1)
        botconfig.setChests(botUsername, chests)
        break
      case 'changeChestType':
        chests = botconfig.getChests(botUsername)
        chests[config.chestId].type = config.value
        botconfig.setChests(botUsername, chests)
        break
      case 'changeChestName':
        chests = botconfig.getChests(botUsername)
        chests[config.chestId].name = config.value
        botconfig.setChests(botUsername, chests)
        break
      case 'changeChestPos':
        chests = botconfig.getChests(botUsername)
        chests[config.chestId].position[config.coord] = config.pos
        botconfig.setChests(botUsername, chests)
        break
      case 'insertItemInChest':
        chests = botconfig.getChests(botUsername)
        chests[config.chestId].items.push({
          item: config.item,
          quantity: config.quantity
        })
        botconfig.setChests(botUsername, chests)
        break
      case 'removeItemFromChest':
        chests = botconfig.getChests(botUsername)
        chests[config.chestId].items.splice(config.itemIndex, 1)
        botconfig.setChests(botUsername, chests)
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
