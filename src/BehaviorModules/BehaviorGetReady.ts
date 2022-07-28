
//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"

module.exports = class BehaviorGetReady {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isReady: boolean


  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetReady'

    this.isReady = false
    this.inventory = require('@modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.checkImReady()
  }

  getIsReady() {
    return this.isReady
  }

  checkImReady() {
    for (let i = 0; i < this.targets.config.itemsToBeReady.length; i++) {
      const itemToBeReady = this.targets.config.itemsToBeReady[i]
      const itemsInUse = this.inventory.countItemsInInventoryOrEquipped(itemToBeReady.item)
      if (itemsInUse < itemToBeReady.quantity) {
        this.isReady = false
        return
      }
    }

    this.isReady = true
  }
}
