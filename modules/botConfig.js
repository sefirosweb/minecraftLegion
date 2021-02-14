const low = require('lowdb')
const Filesync = require('lowdb/adapters/FileSync')
const path = require('path')

function getConn (botName) {
  const adapter = new Filesync(path.join(__dirname, '../botConfig/') + botName + '.json')
  const db = low(adapter)
  const defaultConfig = {
    name: botName,
    job: 'none', // guard, miner -- For a now...
    mode: 'none', // none, pve, pvp
    distance: 10,
    helpFriends: false,
    pickUpItems: false,
    itemsToBeReady: [],
    itemsCanBeEat: [],
    chests: [],
    patrol: [],
    minerCords: {
      xStart: null,
      yStart: null,
      zStart: null,
      xEnd: null,
      yEnd: null,
      zEnd: null,
      orientation: null,
      tunel: null
    }
  }

  db.defaults({ config: defaultConfig }).write()
  return db
}

function getAll (botName) {
  const db = getConn(botName)
  return db.get('config').value()
}

function setJob (botName, job) {
  const db = getConn(botName)
  db.set('config.job', job).write()
}

function getJob (botName) {
  const db = getConn(botName)
  return db.get('config.job').value()
}

function setMode (botName, mode) {
  const db = getConn(botName)
  db.set('config.mode', mode).write()
}

function getMode (botName) {
  const db = getConn(botName)
  return db.get('config.mode').value()
}

function setHelpFriend (botName, mode) {
  const db = getConn(botName)
  if (mode === 'true') {
    mode = true
  } else {
    mode = false
  }
  db.set('config.helpFriends', mode).write()
}

function getHelpFriend (botName) {
  const db = getConn(botName)
  return db.get('config.helpFriends').value()
}

function setPickUpItems (botName, mode) {
  const db = getConn(botName)
  if (mode === 'true') {
    mode = true
  } else {
    mode = false
  }

  db.set('config.pickUpItems', mode).write()
}

function getPickUpItems (botName) {
  const db = getConn(botName)
  return db.get('config.pickUpItems').value()
}

function setDistance (botName, distance) {
  const db = getConn(botName)
  db.set('config.distance', distance).write()
}

function getDistance (botName) {
  const db = getConn(botName)
  return db.get('config.distance').value()
}

function setPatrol (botName, patrol) {
  const db = getConn(botName)
  db.set('config.patrol', patrol).write()
}

function getPatrol (botName) {
  const db = getConn(botName)
  return db.get('config.patrol').value()
}

function getChests (botName) {
  const db = getConn(botName)
  return db.get('config.chests').value()
}

function setChests (botName, chests) {
  const db = getConn(botName)
  db.set('config.chests', chests).write()
}

function getAllChests (botName) {
  const db = getConn(botName)
  const chest = db.get('config.chests').value()
  if (chest === undefined) {
    return {}
  } else {
    return chest
  }
}

function setMinerCords (botName, minerCords) {
  const db = getConn(botName)
  db.set('config.minerCords', minerCords).write()
}

function getMinerCords (botName) {
  const db = getConn(botName)
  return db.get('config.minerCords').value()
}

function setItemsToBeReady (botName, itemsToBeReady) {
  const db = getConn(botName)
  db.set('config.itemsToBeReady', itemsToBeReady).write()
}

function getItemsToBeReady (botName) {
  const db = getConn(botName)
  return db.get('config.itemsToBeReady').value()
}

function setItemsCanBeEat (botName, itemsToBeReady) {
  const db = getConn(botName)
  db.set('config.itemsCanBeEat', itemsToBeReady).write()
}

function getItemsCanBeEat (botName) {
  const db = getConn(botName)
  return db.get('config.itemsCanBeEat').value()
}

module.exports = {
  getAll,
  setJob,
  getJob,
  setMode,
  getMode,
  setHelpFriend,
  getHelpFriend,
  setDistance,
  getDistance,
  setPatrol,
  getPatrol,
  getAllChests,
  setMinerCords,
  getMinerCords,
  setPickUpItems,
  getPickUpItems,
  setItemsToBeReady,
  getItemsToBeReady,
  getItemsCanBeEat,
  setItemsCanBeEat,
  getChests,
  setChests
}
