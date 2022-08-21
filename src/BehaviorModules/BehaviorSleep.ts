import { LegionStateMachineTargets, Bot } from "@/types"
import { StateBehavior } from "mineflayer-statemachine"

export default class BehaviorFollowEntity implements StateBehavior {
  active: boolean

  stateName: string = 'BehaviorSleep'

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  x?: number;
  y?: number;

  isEndFinished: boolean
  bedOcupped: boolean
  cantSleepNow: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.isEndFinished = false
    this.bedOcupped = false
    this.cantSleepNow = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.bedOcupped = false
    this.cantSleepNow = false
    this.interactBlock()
  }

  interactBlock() {
    if (this.targets.position == null) {
      this.isEndFinished = true
      console.log('Block is null')
      return
    }

    const block = this.bot.blockAt(this.targets.position)
    if (block == null || !this.bot.canSeeBlock(block) || !this.bot.isABed(block)) {
      this.isEndFinished = true
      return
    }

    /** HOTFIX until sleep() is fixed **/
    const timeOutForsleep = setTimeout(() => {
      this.bedOcupped = true
      console.log('Exceded time for sleep')
    }, 5000)
    this.bot.once('sleep', () => {
      console.log('clearing timeout')
      clearTimeout(timeOutForsleep)
      this.isEndFinished = true
    })
    /****/
    this.bot.sleep(block)
      .catch(err => {
        /** HOTFIX until sleep() is fixed **/
        console.log('clearing timeout')
        clearTimeout(timeOutForsleep)
        /****/

        if (err.message === 'the bed is occupied' || err.message === 'bot is not sleeping') {
          this.bedOcupped = true
        } else {
          return this.cantSleepNow = true
        }
      })
  }

  isFinished() {
    return this.isEndFinished
  }

  isOccuped() {
    return this.bedOcupped
  }

  isCantSleepNow() {
    return this.cantSleepNow
  }
}
