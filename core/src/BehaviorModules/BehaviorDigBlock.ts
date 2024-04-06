
import { Bot } from "mineflayer"
import { Vec3 } from "vec3"
import { LegionStateMachineTargets } from 'base-types'
import { StateBehavior } from "mineflayer-statemachine"
import { digBlockModule, botWebsocket } from '@/modules'
export class BehaviorDigBlock implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  digBlock: (position: Vec3) => Promise<void>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigBlock'
    const { digBlock } = digBlockModule(bot)

    this.digBlock = digBlock

    this.isEndFinished = false
  }

  isFinished() {
    return this.isEndFinished
  }

  onStateEntered() {
    this.isEndFinished = false

    if (!this.targets.position) {
      this.isEndFinished = true
      return
    }

    const targetBlock = new Vec3(this.targets.position.x, this.targets.position.y, this.targets.position.z)
    this.digBlock(targetBlock)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(() => {
        botWebsocket.log(`Error on dig block ${this.targets.position}`)
      })
  }
}
