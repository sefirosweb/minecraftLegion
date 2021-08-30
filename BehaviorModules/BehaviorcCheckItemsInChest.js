module.exports = class BehaviorcCheckItemsInChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorcCheckItemsInChest'
    this.isEndFinished = false

    this.chest = false
  }

  onStateEntered () {
    this.isEndFinished = false

    this.bot.openContainer(this.targets.chest).then((container, i) => {
      console.log(this.targets.chest)
      console.log(container.slots)
      setTimeout(() => {
        container.close()
        this.isEndFinished = true
      }, 500)
    })
  }

  onStateExited () {
    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }
}
