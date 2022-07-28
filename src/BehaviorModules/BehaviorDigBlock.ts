//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"
import botWebsocket from '@/modules/botWebsocket'
import digBlockModule from '@/modules/digBlockModule'
module.exports = class template {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigBlock'

    this.digBlockModule = digBlockModule(bot)

    this.isEndFinished = false
  }

  isFinished() {
    return this.isEndFinished
  }

  onStateEntered() {
    this.isEndFinished = false
    this.digBlockModule.digBlock(this.targets.position)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(() => {
        botWebsocket.log(`Error on dig block ${this.targets.position}`)
      })
  }
}
