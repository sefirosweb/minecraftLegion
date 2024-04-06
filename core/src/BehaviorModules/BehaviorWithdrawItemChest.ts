
import { sleep, botWebsocket, refreshChest } from '@/modules'
import { ChestTransaction, LegionStateMachineTargets } from 'base-types'
import { Bot, Chest, TransferOptions } from 'mineflayer'
import { StateBehavior } from 'mineflayer-statemachine'
import { Block } from 'prismarine-block'
import { Vec3 } from 'vec3'

export class BehaviorWithdrawItemChest implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  timeLimit?: ReturnType<typeof setTimeout>
  items: Array<ChestTransaction>
  itemIndex: number

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorWithdrawItemChest'
    this.isEndFinished = false

    this.items = []
    this.itemIndex = 0
  }

  onStateEntered() {
    this.isEndFinished = false
    this.items = this.targets.items
    this.itemIndex = 0
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
      .catch(async (err) => {
        console.log(err)
        await sleep(500)
        this.isEndFinished = true
      })
  }

  refreshChest(chestToOpen: Block, container: Chest) {
    refreshChest(chestToOpen, container, this.bot, this.targets)
  }

  withdrawItem(container: Chest): Promise<void> {
    if (this.items.length === this.itemIndex) {
      return Promise.resolve()
    }

    const itemToWithdraw: ChestTransaction = this.items[this.itemIndex] as ChestTransaction
    if (itemToWithdraw.fromSlot !== undefined) {
      return this.withdrawItemFromSlot(itemToWithdraw, container)
    }

    const foundItems = itemToWithdraw.id !== undefined
      ? container.containerItems().filter(i => i.type === itemToWithdraw.id)
      : container.containerItems().filter(i => itemToWithdraw.name && i.name.includes(itemToWithdraw.name))

    if (foundItems.length === 0) {
      this.itemIndex++
      return this.withdrawItem(container)
    }

    const totalItems = foundItems.reduce((acc, item) => acc + item.count, 0)
    const quantity = totalItems < itemToWithdraw.quantity ? totalItems : itemToWithdraw.quantity


    return container.withdraw(foundItems[0].type, null, quantity)
      .then(() => {
        this.items[this.itemIndex].quantity -= quantity
        this.itemIndex++
        return this.withdrawItem(container)
      })
      .catch((err: Error) => Promise.reject(err))
  }

  withdrawItemFromSlot(itemToWithdraw: ChestTransaction, container: Chest): Promise<void> {

    if (itemToWithdraw.fromSlot === undefined) {
      return Promise.reject(new Error('No slot to withdraw'))
    }

    const foundItem = itemToWithdraw.id !== undefined
      ? container.containerItems().find(i => i.type === itemToWithdraw.id)
      : container.containerItems().find(i => itemToWithdraw.name && i.name.includes(itemToWithdraw.name))

    if (!foundItem) {
      this.itemIndex++
      return this.withdrawItem(container)
    }

    const quantity = foundItem.count < itemToWithdraw.quantity ? foundItem.count : itemToWithdraw.quantity

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

    return this.bot.transfer(options)
      .then(() => {
        this.items[this.itemIndex].quantity -= quantity
        this.itemIndex++
        return this.withdrawItem(container)
      })
      .catch((err: Error) => Promise.reject(err))
  }
}
