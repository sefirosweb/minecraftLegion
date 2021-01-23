const botConfig = require('../modules/botConfig')

module.exports = class BehaviorLoadConfig {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'

    this.job = false
    this.mode = 'none'
    this.helpFriends = false
    this.distance = 10
    this.patrol = []
    this.equipmentChest = [] // TODO REMOVE
    this.foodChest = [] // TODO REMOVE
    this.depositChest = []// TODO REMOVE
    this.chests = {}
    this.miner = []
  }

  onStateEntered () {
    this.job = botConfig.getJob(this.bot.username)
    this.mode = botConfig.getMode(this.bot.username)
    this.helpFriends = botConfig.getHelpFriend(this.bot.username)
    this.distance = botConfig.getDistance(this.bot.username)
    this.patrol = botConfig.getPatrol(this.bot.username)
    this.equipmentChest = botConfig.getChest(this.bot.username, 'equipment') // TODO REMOVE
    this.foodChest = botConfig.getChest(this.bot.username, 'food') // TODO REMOVE
    this.depositChest = botConfig.getChest(this.bot.username, 'deposit') // TODO REMOVE
    this.miner = botConfig.getMiner(this.bot.username)

    this.chests = botConfig.getAllChests(this.bot.username)
  }

  getJob () {
    return this.job
  }

  getMode () {
    return this.mode
  }

  getHelpFriend () {
    return this.getHelpFriend
  }

  getDistance () {
    return this.distance
  }

  getPatrol () {
    return this.patrol
  }

  getEquipmentChest () {
    return this.equipmentChest
  }

  getFoodChest () {
    return this.foodChest
  }

  getDepositChest () {
    return this.depositChest
  }

  getMiner () {
    return this.miner
  }

  getChest (chest) {
    return this.chests[chest]
  }
}
