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
      const slots = container.slots
      const chestIndex = this.targets.chests.findIndex(c => c.position.equals(this.targets.chest.position))
      if (chestIndex >= 0) {
        this.targets.chests[chestIndex].slots = slots
      } else {
        this.targets.chest.slots = slots
        this.targets.chests.push(this.targets.chest)
      }

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
