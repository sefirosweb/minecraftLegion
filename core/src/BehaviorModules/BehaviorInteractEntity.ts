
import { LegionStateMachineTargets } from "base-types"
import { Bot } from "mineflayer";
import { StateBehavior } from "minecraftlegion-statemachine"

export class BehaviorInteractEntity implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorInteractEntity'

    this.isEndFinished = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.interactEntity()
  }

  async interactEntity() {
    if (!this.targets.interactEntity) {
      this.isEndFinished = true
      console.log('interactEntity is null')
      return
    }

    await this.bot.lookAt(this.targets.interactEntity.position)
    this.bot.useOn(this.targets.interactEntity)
    this.isEndFinished = true
  }

  isFinished() {
    return this.isEndFinished
  }
}
