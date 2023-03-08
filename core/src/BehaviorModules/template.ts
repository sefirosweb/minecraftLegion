import { LegionStateMachineTargets } from "types/index"
import { Bot } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine"
export default class template implements StateBehavior {
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
