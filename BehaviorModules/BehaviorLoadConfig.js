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
    this.chest = botConfig.getChest(this.bot.username)
    this.foodChest = botConfig.getFoodChest(this.bot.username)
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

  getChest() {
    return this.chest
  }

  getFoodChest() {
    return this.foodChest
  }
}
