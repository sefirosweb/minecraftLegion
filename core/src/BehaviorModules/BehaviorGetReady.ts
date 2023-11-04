import { LegionStateMachineTargets } from "base-types"
import inventoryModule from '@/modules/inventoryModule'
import { StateBehavior } from "mineflayer-statemachine"
import { Bot } from "mineflayer";
export default class BehaviorGetReady implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isReady: boolean

  inventory: ReturnType<typeof inventoryModule>
  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetReady'

    this.isReady = false
    this.inventory = inventoryModule(bot)
  }

  onStateEntered() {
    this.checkImReady()
  }

  getIsReady() {
    return this.isReady
  }

  checkImReady() {
    for (let i = 0; i < this.bot.config.itemsToBeReady.length; i++) {
      const itemToBeReady = this.bot.config.itemsToBeReady[i]
      const itemsInUse = !itemToBeReady.name ? 0 : this.inventory.countItemsInInventoryOrEquipped(itemToBeReady.name)
      if (itemsInUse < itemToBeReady.quantity) {
        this.isReady = false
        return
      }
    }

    this.isReady = true
  }
}
