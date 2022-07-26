module.exports = class template {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorInteractEntity'

    this.isEndFinished = false
  }

  onStateEntered () {
    this.isEndFinished = false
    this.interactEntity()
  }

  async interactEntity () {
    if (this.targets.interactEntity == null) {
      this.isEndFinished = true
      console.log('interactEntity is null')
      return
    }

    await this.bot.lookAt(this.targets.interactEntity.position)
    await this.bot.useOn(this.targets.interactEntity)
    this.isEndFinished = true
  }

  isFinished () {
    return this.isEndFinished
  }
}
