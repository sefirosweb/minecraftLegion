import { Bot, LegionStateMachineTargets } from "@/types"

module.exports = class template {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean


  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorInteractBlock'
    this.isEndFinished = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.interactBlock()
  }

  interactBlock() {
    if (this.targets.position == null) {
      this.isEndFinished = true
      console.log('Block is null')
      return
    }

    const block = this.bot.blockAt(this.targets.position)
    if (block == null || !this.bot.canSeeBlock(block)) {
      this.isEndFinished = true
      return
    }

    this.bot.activateBlock(block)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(err => {
        console.log(err)
      })
  }

  isFinished() {
    return this.isEndFinished
  }
}
