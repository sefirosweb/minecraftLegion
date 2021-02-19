const Vec3 = require('vec3')
const { webServer, webServerPort, webServerPassword } = require('../config')
const io = require('socket.io-client')
const config = require('../config')
const botconfig = require('./botConfig')
const customEvents = require('./customEvents')

let bot
let socket; let friends = []; let masters = []; let loged = false

function loadBot (_bot) {
  bot = _bot
}

function connect () {
  socket = io(webServer + ':' + webServerPort)
  socket.on('connect', () => {
    console.log('Connected to webserver')
    socket.emit('login', webServerPassword)
  })

  socket.on('login', (authenticate) => {
    if (authenticate.auth) {
      loged = true
      socket.emit('addFriend', bot.username)
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
    let itemsToBeReady, patrol, index, temp, minerConfig, chests, itemsCanBeEat, findMaster, isEventLoaded
    switch (config.configToChange) {
      case 'job':
        botconfig.setJob(bot.username, config.value)
        break
      case 'pickUpItems':
        botconfig.setPickUpItems(bot.username, config.value)
        break
      case 'helpFriend':
        botconfig.setHelpFriend(bot.username, config.value)
        break
      case 'mode':
        botconfig.setMode(bot.username, config.value)
        break
      case 'distance':
        botconfig.setDistance(bot.username, config.value)
        break
      case 'InsertItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(bot.username)
        itemsToBeReady.push({
          item: config.value.item,
          quantity: config.value.quantity
        })
        botconfig.setItemsToBeReady(bot.username, itemsToBeReady)
        break
      case 'DeleteItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(bot.username)
        itemsToBeReady.splice(config.value, 1)
        botconfig.setItemsToBeReady(bot.username, itemsToBeReady)
        break
      case 'InsertItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        itemsCanBeEat.push(config.value.item)
        botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        break
      case 'deleteItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        itemsCanBeEat.splice(config.value, 1)
        botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        break
      case 'moveItemCanBeEatNext':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        index = config.value
        if (itemsCanBeEat.length > (index + 1)) {
          temp = itemsCanBeEat[index]
          itemsCanBeEat[index] = itemsCanBeEat[index + 1]
          itemsCanBeEat[index + 1] = temp
          botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        }
        break
      case 'moveItemCanBeEatPrev':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        index = config.value
        if (index > 0) {
          temp = itemsCanBeEat[index]
          itemsCanBeEat[index] = itemsCanBeEat[index - 1]
          itemsCanBeEat[index - 1] = temp
          botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        }
        break
      case 'addPatrol':
        patrol = botconfig.getPatrol(bot.username)
        patrol.push(config.value)
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'removePatrol':
        patrol = botconfig.getPatrol(bot.username)
        patrol.splice(config.value, 1)
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'copyPatrol':
        findMaster = bot.nearestEntity(e => e.type === 'player' && e.username === config.value && e.mobType !== 'Armor Stand')
        if (!findMaster) {
          return
        }

        isEventLoaded = customEvents.listeners('physicTick').find(event => {
          return event.name === 'bound nextPointListener'
        })

        if (!isEventLoaded) {
          prevPoint = undefined
          customEvents.addEvent('physicTick', nextPointListener.bind(this, findMaster))
          botconfig.setCopingPatrol(bot.username, true)
        } else {
          customEvents.removeListener('physicTick', isEventLoaded)
          botconfig.setCopingPatrol(bot.username, false)
        }
        break
      case 'movePatrolNext':
        patrol = botconfig.getPatrol(bot.username)
        index = config.value
        if (patrol.length > (index + 1)) {
          temp = patrol[index]
          patrol[index] = patrol[index + 1]
          patrol[index + 1] = temp
          botconfig.setPatrol(bot.username, patrol)
        }
        break
      case 'movePatrolPrev':
        patrol = botconfig.getPatrol(bot.username)
        index = config.value
        if (index > 0) {
          temp = patrol[index]
          patrol[index] = patrol[index - 1]
          patrol[index - 1] = temp
          botconfig.setPatrol(bot.username, patrol)
        }
        break
      case 'savePositionHasMaster':
        findMaster = bot.nearestEntity(e => e.type === 'player' && e.username === config.value && e.mobType !== 'Armor Stand')
        if (!findMaster) {
          return
        }
        patrol = botconfig.getPatrol(bot.username)
        patrol.push(new Vec3(Math.round(findMaster.position.x * 10) / 10, Math.round(findMaster.position.y * 10) / 10, Math.round(findMaster.position.z * 10) / 10))
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'changeTunnel':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig.tunel = config.value
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'changeOrientation':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig.orientation = config.value
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'changePosMiner':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig[config.value.coord] = config.value.pos
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'insertNewChest':
        chests = botconfig.getChests(bot.username)
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
        botconfig.setChests(bot.username, chests)
        break
      case 'deleteChest':
        chests = botconfig.getChests(bot.username)
        chests.splice(config.value, 1)
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestType':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].type = config.value
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestName':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].name = config.value
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestPos':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].position[config.coord] = config.pos
        botconfig.setChests(bot.username, chests)
        break
      case 'insertItemInChest':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].items.push({
          item: config.item,
          quantity: config.quantity
        })
        botconfig.setChests(bot.username, chests)
        break
      case 'removeItemFromChest':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].items.splice(config.itemIndex, 1)
        botconfig.setChests(bot.username, chests)
        break
    }

    sendConfig()
  })

  socket.on('getConfig', () => {
    sendConfig()
  })
}

function sendConfig () {
  socket.emit('sendAction', {
    action: 'sendConfig',
    value: botconfig.getAll(bot.username)
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

let prevPoint
function nextPointListener (master) {
  if (prevPoint === undefined || master.position.distanceTo(prevPoint) > 3) {
    const patrol = botconfig.getPatrol(bot.username)
    patrol.push(new Vec3(Math.round(master.position.x * 10) / 10, Math.round(master.position.y * 10) / 10, Math.round(master.position.z * 10) / 10))
    prevPoint = master.position.clone()
    botconfig.setPatrol(bot.username, patrol)
    sendConfig()
  }
}

module.exports = {
  loadBot,
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
