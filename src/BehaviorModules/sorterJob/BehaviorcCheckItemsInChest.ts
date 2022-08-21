
//@ts-nocheck

import botWebsocket from '@/modules/botWebsocket'
import { Bot, LegionStateMachineTargets } from '@/types';
import { StateBehavior } from 'mineflayer-statemachine';
import vec3 from 'vec3'
export default class BehaviorcCheckItemsInChest implements StateBehavior {
  active: boolean;
  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;
  isEndFinished: boolean

  canOpenChest: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorcCheckItemsInChest'
    this.isEndFinished = false
    this.canOpenChest = false

    this.chest = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.canOpenChest = false

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for open chest')
      this.isEndFinished = true
    }, 5000)

    this.bot.openContainer(this.targets.sorterJob.chest).then((container, i) => {
      const slots = container.slots.slice(0, container.inventoryStart)
      const chestIndex = Object.values(this.targets.chests).findIndex(c => {
        if (vec3(c.position).equals(this.targets.sorterJob.chest.position)) return true
        if (c.secondBlock && vec3(c.secondBlock.position).equals(this.targets.sorterJob.chest.position)) return true
        if (this.targets.sorterJob.chest.secondBlock && vec3(c.position).equals(this.targets.sorterJob.chest.secondBlock.position)) return true
        if (c.secondBlock && this.targets.sorterJob.chest.secondBlock && vec3(c.secondBlock.position).equals(this.targets.sorterJob.chest.secondBlock.position)) return true
        return false
      })
      if (chestIndex >= 0) {
        this.targets.chests[chestIndex].slots = slots
        this.targets.chests[chestIndex].lastTimeOpen = Date.now()
      } else {
        this.targets.sorterJob.chest.slots = slots
        this.targets.sorterJob.chest.lastTimeOpen = Date.now()

        const chestIndext = Object.keys(this.targets.chests).length
        this.targets.chests[chestIndext] = this.targets.sorterJob.chest
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
