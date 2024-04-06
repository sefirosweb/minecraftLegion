

import { ChestTransaction, Item, LegionStateMachineTargets } from 'base-types'
import { Bot, Chest, TransferOptions } from 'mineflayer'
import { StateBehavior } from 'mineflayer-statemachine'
import { Block } from 'prismarine-block'
import { Vec3 } from 'vec3'
import { refreshChest, botWebsocket, sleep } from '@/modules'
export class BehaviorDepositItemChest implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean
  x?: number
  y?: number

  items: Array<Item>
  timeLimit?: ReturnType<typeof setTimeout>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositItemChest'
    this.isEndFinished = false

    this.items = []
  }

  onStateEntered() {
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.items = [...this.targets.items]

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for deposit items, forcing close')
      this.isEndFinished = true
    }, 5000)

    this.depositAllItems()
  }

  onStateExited() {
    this.isEndFinished = false
    this.targets.items = []
    clearTimeout(this.timeLimit)
  }

  isFinished() {
    return this.isEndFinished
  }

  async depositAllItems() {

    if (!this.targets.position) {
      botWebsocket.log('No target position')
      this.isEndFinished = true
      return
    }

    const chestToOpen = this.bot.blockAt(new Vec3(this.targets.position.x, this.targets.position.y, this.targets.position.z))
    if (!chestToOpen || !['chest', 'ender_chest', 'trapped_chest'].includes(chestToOpen.name)) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.bot.openContainer(chestToOpen)
      .then((c) => {
        const container: Chest = c as Chest
        this.depositItems(container)
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

  checkItemDestinationAndMoveToInventory(container: Chest, toSlot: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (container.slots[toSlot] === null) {
        resolve()
        return
      }

      const emptySlot = container.slots.findIndex((s, sIndex) => s === null && sIndex > container.inventoryStart)
      this.bot.moveSlotItem(toSlot, emptySlot)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  depositItems(container: Chest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToDeposit = this.items.shift() as ChestTransaction

      if (itemToDeposit.toSlot !== undefined) {
        // If the destination is specific
        const options: TransferOptions = {
          window: container,
          itemType: itemToDeposit.id,
          metadata: null,
          // @ts-ignore pending : https://github.com/PrismarineJS/mineflayer/pull/2913
          count: itemToDeposit.quantity,
          sourceStart: container.inventoryStart,
          sourceEnd: container.inventoryEnd,
          destStart: itemToDeposit.toSlot,
          destEnd: itemToDeposit.toSlot + 1
        }

        this.checkItemDestinationAndMoveToInventory(container, itemToDeposit.toSlot)
          .then(() => {
            this.bot.transfer(options)
              .then(() => {
                this.depositItems(container)
                  .then(() => {
                    resolve()
                  })
                  .catch(err => {
                    reject(err)
                  })
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch(err => {
            reject(err)
          })
      } else {
        // If the destination is NOT specific
        if (container.containerItems().length === container.inventoryStart) {
          reject(new Error('The chest is full'))
          return
        }

        container.deposit(itemToDeposit.id, null, itemToDeposit.quantity)
          .then(() => {
            this.depositItems(container)
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  }
}
