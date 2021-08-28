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
    if (this.targets.position == null) {
      this.isEndFinished = true
      console.log('Entity is null')
      return
    }

    await this.bot.lookAt(this.targets.entity.position)
    await this.bot.useOn(this.targets.entity)
    this.isEndFinished = true
  }

  isFinished () {
    return this.isEndFinished
  }
}
