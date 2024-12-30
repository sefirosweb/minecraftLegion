import { ChestBlock, LegionStateMachineTargets } from 'base-types';
import { StateBehavior } from 'minecraftlegion-statemachine';
import vec3 from 'vec3'
import { v4 as uuidv4 } from 'uuid';
import { Bot, Dimension_V2 } from 'mineflayer';
import _ from 'lodash';
import { botWebsocket } from '@/modules'

export class BehaviorcCheckItemsInChest implements StateBehavior {
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

    const chest = _.cloneDeep(this.targets.sorterJob.chest)

    const chestBlock = this.bot.blockAt(this.targets.sorterJob.chest.position)
    if (!chestBlock) throw new Error('Chest not found!')

    this.bot.openContainer(chestBlock)
      .then((container) => {
        const slots = container.slots.slice(0, container.inventoryStart)
        const chestIndex = Object.entries(this.targets.chests).find(entry => {
          const c = entry[1]
          if (vec3(c.position).equals(chest.position)) return true
          if (c.position_2 && vec3(c.position_2).equals(chest.position)) return true
          return false
        })

        if (chestIndex) {

          // @ts-ignore
          this.targets.chests[chestIndex[0]].slots = slots
          this.targets.chests[chestIndex[0]].lastTimeOpen = Date.now()

        } else {

          const newChest: ChestBlock = {
            dimension: this.bot.game.dimension as Dimension_V2,
            position: chest.position,
            // @ts-ignore
            slots,
            lastTimeOpen: Date.now()
          }

          const chestIndext = uuidv4()
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
