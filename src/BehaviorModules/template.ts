import { Bot, LegionStateMachineTargets } from "@/types"
module.exports = class template {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'template'


    this.isEndFinished = false
  }

  onStateEntered() {
    this.isEndFinished = false
  }

  onStateExited() {

  }

  doSomething() {

  }

  isFinished() {
    return this.isEndFinished
  }
}
