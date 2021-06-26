module.exports = class BehaviorFertilize {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFertilize'
    this.success = false
    this.isEndFinished = false
  }

  onStateExited () {
    this.isEndFinished = false
    this.success = false
    clearTimeout(this.timeLimit)
  }

  async onStateEntered () {
    this.timeLimit = setTimeout(() => {
      console.log('Time exceded for fertilize')
      this.isEndFinished = true
    }, 5000)

    this.isEndFinished = false
    this.success = false
    await this.fertilize()
  }

  async fertilize () {
    try {
      const slotID = this.bot.getEquipmentDestSlot('hand')
      if (this.bot.inventory.slots[slotID] === null || !this.bot.inventory.slots[slotID].name.includes('hoe')) { // no have equiped hoe in off hand
        const hoe = this.bot.inventory.items().find(item => item.name.includes('hoe'))
        await this.bot.equip(hoe, 'hand')
      }
      await this.bot.lookAt(this.targets.position)
      await this.bot.activateBlock(this.targets.block)

      setTimeout(function () {
        const block = this.bot.blockAt(this.targets.position)
        if (block.name !== 'farmland') {
          console.log(`${block.name} is not farmland!`)
          this.fertilize()
        } else {
          this.isEndFinished = true
        }
      }.bind(this), 500)
    } catch (err) {
      console.log('Error on fertilize')
      setTimeout(function () {
        this.fertilize()
      }.bind(this), 500)
    }
  }

  isFinished () {
    return this.isEndFinished
  }

  isSuccess () {
    return this.success
  }
}
