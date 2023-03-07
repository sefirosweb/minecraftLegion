
import { LegionStateMachineTargets } from "@/types"
import { BlocksCanFertilize } from "@/types/defaultTypes"
import { Bot } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine"
import { Vec3 } from "vec3"
export default class BehaviorFertilize implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly blocksCanFertilize: Array<string>
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  success: boolean
  timeLimit?: ReturnType<typeof setTimeout>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFertilize'
    this.success = false
    this.isEndFinished = false
    this.blocksCanFertilize = Object.keys(BlocksCanFertilize)
  }

  onStateExited() {
    this.isEndFinished = false
    this.success = false
    clearTimeout(this.timeLimit)
  }

  async onStateEntered() {
    this.timeLimit = setTimeout(() => {
      console.log('Time exceded for fertilize')
      this.isEndFinished = true
    }, 5000)

    this.isEndFinished = false
    this.success = false
    await this.fertilize()
  }

  async fertilize() {
    try {

      if (!this.targets.position) {
        throw new Error('No position definied')
      }

      if (!this.targets.block) {
        throw new Error('No block definied')
      }

      const targetPosition = new Vec3(this.targets.position.x, this.targets.position.y, this.targets.position.z)

      const slotID = this.bot.getEquipmentDestSlot('hand')
      if (this.bot.inventory.slots[slotID] === null || !this.bot.inventory.slots[slotID].name.includes('hoe')) {
        const hoe = this.bot.inventory.items().find(item => item.name.includes('hoe'))

        if (!hoe) {
          throw new Error('No hoe found')
        }

        await this.bot.equip(hoe, 'hand')
      }


      await this.bot.lookAt(targetPosition)
      await this.bot.activateBlock(this.targets.block)

      setTimeout(() => {
        const block = this.bot.blockAt(targetPosition)

        if (!block) {
          throw Error('No block!')
        }

        if (block.name === 'farmland') {
          this.success = true
          this.isEndFinished = true
          return
        }

        if (this.canBeFertilized(block.name)) {
          console.log(`${block.name} can't be fertilized!`)
          this.isEndFinished = true
          return
        }

        this.fertilize()
      }, 500)
    } catch (err) {
      console.log('Error on fertilize')
      setTimeout(() => {
        this.fertilize()
      }, 500)
    }
  }


  canBeFertilized(blockName: string) {
    return Object.values(this.blocksCanFertilize).includes(blockName)
  }

  isFinished() {
    return this.isEndFinished
  }

  isSuccess() {
    return this.success
  }
}
