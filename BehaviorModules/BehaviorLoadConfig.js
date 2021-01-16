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
    this.equipmentChest = []
    this.foodChest = []
    this.depositChest = []
    this.miner = []
  }

  onStateEntered () {
    this.job = botConfig.getJob(this.bot.username)
    this.mode = botConfig.getMode(this.bot.username)
    this.helpFriends = botConfig.getHelpFriend(this.bot.username)
    this.distance = botConfig.getDistance(this.bot.username)
    this.patrol = botConfig.getPatrol(this.bot.username)
    this.equipmentChest = botConfig.getChest(this.bot.username, 'equipment')
    this.foodChest = botConfig.getChest(this.bot.username, 'food')
    this.depositChest = botConfig.getChest(this.bot.username, 'deposit')
    this.miner = botConfig.getMiner(this.bot.username)
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
}
