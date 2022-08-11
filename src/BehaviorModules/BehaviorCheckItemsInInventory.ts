//@ts-nocheck
import { Bot, DepositType, LegionStateMachineTargets, Item, GetResumeInventory } from "@/types"
import inventoryModule from '@/modules/inventoryModule'
import { Item as McItem } from "prismarine-item"

module.exports = class BehaviorCheckItemsInInventory {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean
  x?: number
  y?: number

  itemsToCheck: Array<GetResumeInventory>
  isDeposit: DepositType
  inventoryModule: ReturnType<typeof inventoryModule>

  constructor(bot: Bot, targets: LegionStateMachineTargets, itemsToCheck: Array<any> = [], isDeposit: DepositType = 'deposit') {

    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorCheckItemsInInventory'
    this.isEndFinished = false
    this.itemsToCheck = itemsToCheck
    this.isDeposit = isDeposit

    this.inventoryModule = inventoryModule(this.bot)
  }

  setItemsToCheck(itemsToCheck: Array<GetResumeInventory>) {
    this.itemsToCheck = itemsToCheck
  }

  setIsDeposit(isDeposit: DepositType) {
    this.isDeposit = isDeposit
  }

  onStateEntered() {
    this.isEndFinished = false
    this.targets.items = []

    if (this.isDeposit === 'depositAll') {
      this.getItemsToDepositAll()
    }
    if (this.isDeposit === 'deposit') {
      this.getItemsToDeposit()
    }
    if (this.isDeposit === 'withdraw') {
      this.getItemsToWithdraw()
    }
  }

  getItemsToDepositAll() {
    const items: Array<GetResumeInventory> = this.getResumeInventory(false)

    const itemsToDeposit: Array<GetResumeInventory> = []
    items.forEach(slot => {
      const itemToExclude = this.itemsToCheck.find(i => i.item === slot.name)

      if (itemToExclude === undefined) {
        itemsToDeposit.push(slot)
      } else {
        slot.quantity -= itemToExclude.quantity
        if (slot.quantity > 0) {
          itemsToDeposit.push(slot)
        }
      }

    })

    this.targets.items = itemsToDeposit
    this.isEndFinished = true
  }

  getItemsToDeposit() {
    const items = this.getResumeInventory(false)

    const itemsToDeposit = []

    this.itemsToCheck.forEach(slot => {
      const itemToExclude = items.find(i => i.name === slot.item)

      if (itemToExclude !== undefined) {
        itemToExclude.quantity -= slot.quantity
        if (itemToExclude.quantity > 0) {
          itemsToDeposit.push(itemToExclude)
        }
      }

    })

    this.targets.items = itemsToDeposit
    this.isEndFinished = true
  }

  getItemsToWithdraw() {
    const items: Array<GetResumeInventory> = this.getResumeInventory(true)

    const itemsToWithdraw: Array<Item> = []
    this.itemsToCheck.forEach(slot => {
      const itemToExclude = items.find(i => i.name === slot.item)
      if (itemToExclude === undefined) {
        itemsToWithdraw.push(slot)
      } else {
        slot.quantity -= itemToExclude.quantity
        if (slot.quantity > 0) {
          itemsToWithdraw.push(slot)
        }
      }
    })

    this.targets.items = itemsToWithdraw
    this.isEndFinished = true
  }

  isFinished() {
    return this.isEndFinished
  }

  getEquipedItems(): Array<McItem> {
    const equipedItems = []

    if (this.bot.inventory.slots[5]) equipedItems.push(this.bot.inventory.slots[5]) // helmet
    if (this.bot.inventory.slots[6]) equipedItems.push(this.bot.inventory.slots[6]) // chestplate
    if (this.bot.inventory.slots[7]) equipedItems.push(this.bot.inventory.slots[7]) // leggings
    if (this.bot.inventory.slots[8]) equipedItems.push(this.bot.inventory.slots[8]) // boots
    if (this.bot.inventory.slots[45]) equipedItems.push(this.bot.inventory.slots[45]) // shield

    return equipedItems
  }

  getResumeInventory(withEquip: boolean): Array<GetResumeInventory> {
    let equipItems: Array<McItem> = []
    if (withEquip) {
      equipItems = this.getEquipedItems()
    }

    const items: Array<GetResumeInventory> = []

    this.bot.inventory.items().concat(equipItems).forEach(slot => {
      const itemSlot = {
        name: slot.name,
        type: slot.type,
        quantity: slot.count
      }

      const index = items.findIndex(i => i.type === slot.type)
      if (index >= 0) {
        items[index].quantity += slot.count
      } else {
        items.push(itemSlot)
      }
    })

    return items
  }
}
