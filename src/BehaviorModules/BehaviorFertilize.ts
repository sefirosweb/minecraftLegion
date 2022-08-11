
//@ts-nocheck

import { Bot, LegionStateMachineTargets } from "@/types"
import { BlocksCanFertilize } from "@/types/defaultTypes"
module.exports = class BehaviorFertilize {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly blocksCanFertilize: Array<BlocksCanFertilize>
  stateName: string
  isEndFinished: boolean
  success: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFertilize'
    this.success = false
    this.isEndFinished = false
    this.blocksCanFertilize = Object.values(BlocksCanFertilize)
  }

  onStateExited() {
    this.isEndFinished = false
    this.success = false
    clearTimeout(this.timeLimit)
  }

  async onStateEntered() {
    this.timeLimit = setTimeout(() => {
      console.log('Time exceded for fertilize')
      this.isEndFinished = true
    }, 5000)

    this.isEndFinished = false
    this.success = false
    await this.fertilize()
  }

  async fertilize() {
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
        if (block.name === 'farmland') {
          this.success = true
          this.isEndFinished = true
          return
        }

        if (!this.blocksCanFertilize.includes(block.name)) {
          console.log(`${block.name} can't be fertilized!`)
          this.isEndFinished = true
          return
        }

        this.fertilize()
      }.bind(this), 500)
    } catch (err) {
      console.log('Error on fertilize')
      setTimeout(function () {
        this.fertilize()
      }.bind(this), 500)
    }
  }

  isFinished() {
    return this.isEndFinished
  }

  isSuccess() {
    return this.success
  }
}
