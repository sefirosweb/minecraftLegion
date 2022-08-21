
import botWebsocket from '@/modules/botWebsocket'
import { sleep, getSecondBlockPosition } from '@/modules/utils'
import { Bot, ChestBlock, ChestProperty, ChestTransaction, Dimensions, LegionStateMachineTargets } from '@/types'
import { Chest, TransferOptions } from 'mineflayer'
import { StateBehavior } from 'mineflayer-statemachine'
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
    const chestToOpen = this.bot.blockAt(new Vec3(this.targets.position?.x, this.targets.position?.y, this.targets.position?.z)) as ChestBlock | null
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

  withdrawItem(container: Chest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToWithdraw: ChestTransaction = this.items.shift() as ChestTransaction

      const foundItem = itemToWithdraw.id !== undefined
        //@ts-ignore pending to fix from mineflater
        ? container.containerItems().find(i => i.type === itemToWithdraw.id)
        //@ts-ignore pending to fix from mineflater
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
          //@ts-ignore pending to fix from mineflater
          windows: container,
          itemType: foundItem.type,
          metadata: null,
          count: quantity,
          sourceStart: itemToWithdraw.fromSlot,
          sourceEnd: itemToWithdraw.fromSlot + 1,
          //@ts-ignore pending to fix from mineflater
          destStart: container.inventoryStart,
          //@ts-ignore pending to fix from mineflater
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
