const low = require('lowdb')
const Filesync = require('lowdb/adapters/FileSync')
const path = require('path')

function getConn (botName) {
  const adapter = new Filesync(path.join(__dirname, '../botConfig/') + botName + '.json')
  const db = low(adapter)
  const defaultConfig = {
    name: botName,
    job: 'none', // guard, archer, farmer
    mode: 'none', // none, pve, pvp
    distance: 10,
    help_friends: false,
    minerCords: {},
    chests: {},
    patrol: []
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
  db.set('config.help_friends', mode).write()
}

function getHelpFriend (botName) {
  const db = getConn(botName)
  return db.get('config.help_friends').value()
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

function setChest (botName, chest, chestName) {
  const db = getConn(botName)
  const chests = db.get('config.chests').value()
  chests[chestName] = chest
  db.set('config.chests', chests).write()
}

function getChest (botName, chestName) {
  const db = getConn(botName)
  const chest = db.get('config.chests').value()[chestName]
  if (chest === undefined) {
    return []
  } else {
    return chest
  }
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

function setMiner (botName, minerCords) {
  const db = getConn(botName)
  db.set('config.minerCords', minerCords).write()
}

function getMiner (botName) {
  const db = getConn(botName)
  return db.get('config.minerCords').value()
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
  setChest,
  getChest,
  getAllChests,
  setMiner,
  getMiner
}
