
import botWebsocket from '@/modules/botWebsocket'
import refreshChest from '@/modules/refreshChests'
import { sleep, } from '@/modules/utils'
import { ChestTransaction, LegionStateMachineTargets } from '@/types'
import { Bot, Chest, TransferOptions } from 'mineflayer'
import { StateBehavior } from 'mineflayer-statemachine'
import { Block } from 'prismarine-block'
import { Vec3 } from 'vec3'

export default class BehaviorWithdrawItemChest implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  timeLimit?: ReturnType<typeof setTimeout>
  items: Array<ChestTransaction>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorWithdrawItemChest'
    this.isEndFinished = false

    this.items = []
  }

  onStateEntered() {
    this.isEndFinished = false
    this.items = [...this.targets.items]
    botWebsocket.log('Items to withdraw ' + JSON.stringify(this.items))

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for get items, forcing close')
      this.isEndFinished = true
    }, 5000)

    this.withdrawAllItems()
  }

  onStateExited() {
    this.isEndFinished = false
    clearTimeout(this.timeLimit)
  }

  isFinished() {
    return this.isEndFinished
  }

  async withdrawAllItems() {
    if (!this.targets.position) return
    const chestToOpen = this.bot.blockAt(new Vec3(this.targets.position?.x, this.targets.position?.y, this.targets.position?.z))
    if (!chestToOpen) {
      return
    }

    if (!['chest', 'ender_chest', 'trapped_chest'].includes(chestToOpen.name)) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.bot.openContainer(chestToOpen)
      .then((c) => {
        const container: Chest = c as Chest
        this.withdrawItem(container)
          .then(async () => {
            this.refreshChest(chestToOpen, container)
            await sleep(200)
            container.close()
            await sleep(500)
            this.isEndFinished = true
          })
          .catch(async (err) => {
            this.refreshChest(chestToOpen, container)
            console.log(err)
            await sleep(200)
            container.close()
            await sleep(500)
            this.isEndFinished = true
          })

      })
  }

  refreshChest(chestToOpen: Block, container: Chest) {
    refreshChest(chestToOpen, container, this.bot, this.targets)
  }

  withdrawItem(container: Chest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToWithdraw: ChestTransaction = this.items.shift() as ChestTransaction

      const foundItem = itemToWithdraw.id !== undefined
        ? container.containerItems().find(i => i.type === itemToWithdraw.id)
        : container.containerItems().find(i => itemToWithdraw.name && i.name.includes(itemToWithdraw.name))

      if (!foundItem) {
        this.withdrawItem(container)
          .then(() => {
            resolve()
          })
          .catch(err => {
            reject(err)
          })
        return
      }

      const quantity = foundItem.count < itemToWithdraw.quantity ? foundItem.count : itemToWithdraw.quantity

      if (itemToWithdraw.fromSlot !== undefined) {

        const options: TransferOptions = {
          // @ts-ignore pending to fix from mineflater
          windows: container,
          itemType: foundItem.type,
          metadata: null,
          count: quantity,
          sourceStart: itemToWithdraw.fromSlot,
          sourceEnd: itemToWithdraw.fromSlot + 1,
          destStart: container.inventoryStart,
          destEnd: container.inventoryEnd
        }

        this.bot.transfer(options)
          .then(() => {
            this.withdrawItem(container)
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch((err: Error) => {
            reject(err)
          })
      } else {
        container.withdraw(foundItem.type, null, quantity)
          .then(() => {
            this.withdrawItem(container)
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch((err: Error) => {
            reject(err)
          })
      }
    })
  }
}
