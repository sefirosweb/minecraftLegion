import botWebsocket from '@/modules/botWebsocket'
import { Bot, ChestBlock, LegionStateMachineTargets } from '@/types';
import { StateBehavior } from 'mineflayer-statemachine';
import vec3 from 'vec3'
export default class BehaviorcCheckItemsInChest implements StateBehavior {
  active: boolean;
  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;
  isEndFinished: boolean

  canOpenChest: boolean
  timeLimit?: ReturnType<typeof setTimeout>
  x?: number;
  y?: number;

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorcCheckItemsInChest'
    this.isEndFinished = false
    this.canOpenChest = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.canOpenChest = false

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for open chest')
      this.isEndFinished = true
    }, 5000)


    if (!this.targets.sorterJob.chest) {
      throw new Error('Chest ist not defined!')
    }

    const chest = structuredClone(this.targets.sorterJob.chest)

    const chestBlock = this.bot.blockAt(this.targets.sorterJob.chest.position)
    if(!chestBlock) throw new Error('Chest not found!')

    this.bot.openContainer(chestBlock)
      .then((container) => {
        const slots = container.slots.slice(0, container.inventoryStart)
        const chestIndex = Object.values(this.targets.chests).findIndex(c => {
          if (vec3(c.position).equals(chest.position)) return true
          if (c.position_2 && vec3(c.position_2).equals(chest.position)) return true
          return false
        })

        if (chestIndex >= 0) {

          this.targets.chests[chestIndex].slots = slots
          this.targets.chests[chestIndex].lastTimeOpen = Date.now()

        } else {

          const newChest: ChestBlock = {
            dimension: this.bot.game.dimension,
            position: chest.position,
            slots,
            lastTimeOpen: Date.now()
          }

          const chestIndext = Object.keys(this.targets.chests).length
          this.targets.chests[chestIndext] = newChest
        }

        botWebsocket.sendAction('setChests', this.targets.chests)

        setTimeout(() => {
          container.close()
          this.canOpenChest = true
          this.isEndFinished = true
        }, 500)
      })
  }

  onStateExited() {
    this.isEndFinished = false
    clearTimeout(this.timeLimit)
  }

  isFinished() {
    return this.isEndFinished
  }

  getCanOpenChest() {
    return this.canOpenChest
  }
}
