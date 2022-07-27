//@ts-nocheck

import { Bot, LegionStateMachineTargets } from "@/types"

class BehaviorAttack {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string

  playerIsFound: boolean

  lastAttack: number

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorAttack'

    this.playerIsFound = false
    this.lastAttack = Date.now()

    this.inventory = require('@modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.bot.lookAt(this.targets.entity.position.offset(0, 1, 0))
    this.checkHandleSword()
    this.bot.attack(this.targets.entity)
  }

  nextAttack() {
    const currentDate = Date.now()
    if (currentDate - this.lastAttack > 500) {
      this.lastAttack = currentDate
      return true
    }
    return false
  }

  checkHandleSword() {
    const swordHandled = this.inventory.checkItemEquiped('sword')

    if (swordHandled) { return }

    const itemEquip = this.bot.inventory.items().find(item => item.name.includes('sword'))
    if (itemEquip) {
      this.bot.equip(itemEquip, 'hand')
    }
  }
}
module.exports = BehaviorAttack
