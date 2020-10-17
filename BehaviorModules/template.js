module.exports = class template {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'template'
  }

  onStateEntered () {
    this.targets.targetEntity = this.bot.nearestEntity(() => true)
  }

  onStateExited () {
    this.targets.targetEntity = this.bot.nearestEntity(() => true)
  }

  getPlayerEntity (playerName) {
    this.targets.entity = this.checkPlayer(playerName) || undefined
    this.playerIsFound = this.targets.entity !== undefined
  }
}
