const botConfig = require('../modules/botConfig')

module.exports = class BehaviorLoadConfig {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'

    this.job = false
    this.mode = 'none'
    this.distance = 10
    this.patrol = []
  }

  onStateEntered() {
    this.job = botConfig.getJob(this.bot.username)
    this.mode = botConfig.getMode(this.bot.username)
    this.distance = botConfig.getDistance(this.bot.username)
    this.patrol = botConfig.getPatrol(this.bot.username)
    this.equipmentChest = botConfig.getChest(this.bot.username, 'equipment')
    this.foodChest = botConfig.getChest(this.bot.username, 'food')
    this.depositChest = botConfig.getChest(this.bot.username, 'deposit')
  }

  getJob() {
    return this.job
  }

  getMode() {
    return this.mode
  }

  getDistance() {
    return this.distance
  }

  getPatrol() {
    return this.patrol
  }

  getEquipmentChest() {
    return this.equipmentChest
  }

  getFoodChest() {
    return this.foodChest
  }

  getDepositChest() {
    return this.depositChest
  }

}
