
//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"
import botWebsocket from '@/modules/botWebsocket'

module.exports = class BehaviorEquipAll {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEquipAll'

    this.isEndFinished = false

    this.inventory = require('@modules/inventoryModule')(this.bot)
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

  equipAllItems() {
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
