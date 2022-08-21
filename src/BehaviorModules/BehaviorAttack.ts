
import { Bot, LegionStateMachineTargets } from "@/types"
import inventoryModule from '@/modules/inventoryModule'
import { StateBehavior } from "mineflayer-statemachine"
export default class BehaviorAttack implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number


  lastAttack: number
  inventory: ReturnType<typeof inventoryModule>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorAttack'

    this.lastAttack = Date.now()
    this.inventory = inventoryModule(this.bot)
  }

  onStateEntered() {
    if (!this.targets.entity) return
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

    const itemEquip = this.bot.inventory.items().find(item => item.name.includes('sword')) // TODO ADD axes hoes etc for combat
    if (itemEquip) {
      this.bot.equip(itemEquip, 'hand')
    }
  }
}