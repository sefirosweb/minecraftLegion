
import { LegionStateMachineTargets } from "@/types"
import botWebsocket from '@/modules/botWebsocket'
import inventoryModule from '@/modules/inventoryModule'
import { StateBehavior } from "mineflayer-statemachine"
import { Bot } from "mineflayer";
export default class BehaviorEquipAll implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  inventory: ReturnType<typeof inventoryModule>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEquipAll'

    this.isEndFinished = false

    this.inventory = inventoryModule(this.bot)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.equipAllItems()
      .then(() => {
        this.isEndFinished = true
      })
      .catch((error) => {
        this.isEndFinished = true
        botWebsocket.log(`Error Equip Items + ${JSON.stringify(error)}`)
      })
  }

  onStateExited() {
    this.isEndFinished = false
  }

  isFinished() {
    return this.isEndFinished
  }

  equipAllItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.inventory.equipItem('helmet')
        .then(() => {
          return this.inventory.equipItem('chestplate')
        })
        .then(() => {
          return this.inventory.equipItem('leggings')
        })
        .then(() => {
          return this.inventory.equipItem('boots')
        })
        .then(() => {
          return this.inventory.equipItem('shield')
        })
        .then(() => {
          return this.inventory.equipItem('sword')
        })
        .then(() => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}
