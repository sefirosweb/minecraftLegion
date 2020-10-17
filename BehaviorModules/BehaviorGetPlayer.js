module.exports = class BehaviorGetPlayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetPlayer'
    this.playerIsFound = false
    this.playername = false
  }

  onStateEntered () {
    this.getPlayerEntity(this.playerName)
  }

  getPlayerEntity (playerName) {
    this.targets.entity = this.checkPlayer(playerName) || undefined
    this.playerIsFound = this.targets.entity !== undefined
    if (this.playerIsFound) {
      this.playerName = playerName
    }
    return this.playerIsFound
  }

  checkPlayer (playerName) {
    for (const entityName of Object.keys(this.bot.entities)) {
      const entity = this.bot.entities[entityName]
      if (entity === this.bot.entity) { continue }
      if (entity.type !== 'player') { continue }
      if (entity.username === playerName) { return entity }
    }
    return null
  }

  playerFound () {
    return this.playerIsFound
  }

  getPlayerName () {
    return this.playerName
  }
}
