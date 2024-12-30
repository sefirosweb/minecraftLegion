import { LegionStateMachineTargets } from "base-types"
import { inventoryModule, botWebsocket } from '@/modules'
import { StateBehavior } from "minecraftlegion-statemachine"
import { Bot } from "mineflayer";
import { GetMasterGrade } from "minecrafthawkeye";
export class BehaviorLongAttack implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  playername?: string
  infoShot: GetMasterGrade | undefined
  prevTime: number | false
  playerIsFound: boolean
  preparingShot: boolean
  lastAttack: number
  inventory: ReturnType<typeof inventoryModule>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLongAttack'

    this.playerIsFound = false
    this.lastAttack = Date.now()

    this.inventory = inventoryModule(this.bot)

    this.preparingShot = false
    this.prevTime = false
  }

  onStateEntered() {
    this.shot()
  }

  shot() {
    if (!this.preparingShot) {
      this.bot.activateItem()
      this.preparingShot = true
      this.prevTime = Date.now()
    }

    if (!this.checkBowEquipped()) {
      this.equipBow()
      this.preparingShot = false
    }

    if (this.infoShot) {
      this.bot.look(this.infoShot.yaw, this.infoShot.pitch)

      const currentTime = Date.now()
      if (this.prevTime && this.preparingShot && currentTime - this.prevTime > 1200) {
        this.bot.deactivateItem()
        this.preparingShot = false
      }
    }
  }

  setInfoShot(infoShot: GetMasterGrade | undefined) {
    this.infoShot = infoShot
  }

  equipBow() {
    const itemEquip = this.bot.inventory.items().find(item => item.name.includes('bow'))
    if (itemEquip) {
      this.bot.equip(itemEquip, 'hand')
        .catch((error: Error) => {
          botWebsocket.log('Error equip bow: ' + error)
        })
    }
  }

  checkBow() {
    const bow = this.bot.inventory.items().find(item => item.name.includes('bow'))
    if (bow === undefined) {
      return false
    } else {
      return true
    }
  }

  checkArrows() {
    const arrows = this.bot.inventory.items().find(item => item.name.includes('arrow'))
    if (arrows === undefined) {
      return false
    } else {
      return true
    }
  }

  checkBowEquipped() {
    return this.inventory.checkItemEquiped('bow')
  }

  checkBowAndArrow() {
    if (this.checkBow() && this.checkArrows()) {
      return true
    } else {
      return false
    }
  }
}
