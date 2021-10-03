const botWebsocket = require('@modules/botWebsocket')
module.exports = class template {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigBlock'

    this.digBlockModule = require('@modules/digBlockModule')(bot)

    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  onStateEntered () {
    this.isEndFinished = false
    this.digBlockModule.digBlock(this.targets.position)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(() => {
        botWebsocket.log(`Error on dig block ${this.targets.position}`)
      })
  }
}
