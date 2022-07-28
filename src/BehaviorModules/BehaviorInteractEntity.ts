
//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"

module.exports = class template {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
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
    if (this.targets.interactEntity === null) {
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
