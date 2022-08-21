

import botWebsocket from '@/modules/botWebsocket'
import { sleep, getSecondBlockPosition } from '@/modules/utils'
import { Bot, ChestBlock, ChestProperty, ChestTransaction, Dimensions, Item, LegionStateMachineTargets } from '@/types'
import { Chest, TransferOptions } from 'mineflayer'
import { StateBehavior } from 'mineflayer-statemachine'
import { Vec3 } from 'vec3'
export default class BehaviorDepositItemChest implements StateBehavior {
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

    const chestToOpen = this.bot.blockAt(new Vec3(this.targets.position.x, this.targets.position.y, this.targets.position.z)) as ChestBlock | null
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

  refreshChest(chestToOpen: ChestBlock, container: Chest) {
    const chest = Object.values(this.targets.chests).find(c => {
      const chestPosition = new Vec3(c.position.x, c.position.y, c.position.z)
      if (chestPosition.equals(chestToOpen.position)) return true

      if (!c.secondBlock) return false
      const chestSecondBlock = new Vec3(c.secondBlock.x, c.secondBlock.y, c.secondBlock.z)
      if (chestSecondBlock.equals(chestToOpen.position)) return true
      return false
    })

    //@ts-ignore pending to fix from mineflater
    const slots = container.slots.slice(0, container.inventoryStart)
    if (!chest) {
      chestToOpen.slots = slots
      chestToOpen.lastTimeOpen = Date.now()

      const props = chestToOpen.getProperties() as ChestProperty
      const offset = getSecondBlockPosition(props.facing, props.type)
      if (offset) {
        chestToOpen.secondBlock = chestToOpen.position.offset(offset.x, offset.y, offset.z)
      }

      //@ts-ignore pending to fix from mineflater
      chestToOpen.dimension = this.bot.game.dimension as Dimensions // Todo mending mineflayer fix

      const chestIndext = Object.keys(this.targets.chests).length
      this.targets.chests[chestIndext] = chestToOpen
    } else {
      chest.slots = slots
      chest.lastTimeOpen = Date.now()
    }
    botWebsocket.sendAction('setChests', this.targets.chests)
  }

  checkItemDestinationAndMoveToInventory(container: Chest, toSlot: number): Promise<void> {
    return new Promise((resolve, reject) => {
      //@ts-ignore pending to fix from mineflater
      if (container.slots[toSlot] === null) {
        resolve()
        return
      }

      //@ts-ignore pending to fix from mineflater
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
          //@ts-ignore pending to fix from mineflater
          windows: container,
          itemType: itemToDeposit.id,
          metadata: null,
          count: itemToDeposit.quantity,
          //@ts-ignore pending to fix from mineflater
          sourceStart: container.inventoryStart,
          //@ts-ignore pending to fix from mineflater
          sourceEnd: container.inventoryEnd,
          //@ts-ignore pending to fix from mineflater
          destStart: itemToDeposit.toSlot,
          //@ts-ignore pending to fix from mineflater
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
        //@ts-ignore pending to fix from mineflater
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
