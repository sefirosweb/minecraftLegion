//@ts-nocheck
import { Bot, Chest, Item, LegionStateMachineTargets } from "@/types"
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'

const chestModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const { findItemsInChests } = sorterJob(bot)
  const { getResumeInventoryV2, getGenericItems } = inventoryModule(bot)

  const getItemsToWithdrawInChests = (chests: Array<Chest>) => {
    const chestsFiltered: Array<Item> = []

    chests
      .filter((c) => c.type === 'withdraw')
      .forEach(c => {
        c.items.forEach((i) => {
          const key = chestsFiltered.findIndex((r) => r.item === i.item)
          if (key >= 0) {
            chestsFiltered[key].quantity += i.quantity
          } else {
            chestsFiltered.push(i)
          }
        })
      })

    return chestsFiltered
  }

  const findChestsToWithdraw = (botChests: Array<Chest>, sharedChests: Array<Chest>) => {
    const resumeInventory = getResumeInventoryV2()
    const itemsToWithdrawInChests = getItemsToWithdrawInChests(botChests) // bsca que items hay que sacar
    const itemsToWithdraw = itemsToWithdrawInChests.reduce((returnData, i) => {
      // resta los items que hay que sacar - inventario
      let invItem
      if (getGenericItems().includes(i.item)) {
        invItem = resumeInventory.find((inv) => inv.name.includes(i.item))
      } else {
        invItem = resumeInventory.find((inv) => inv.name === i.item)
      }
      i.quantity = invItem ? i.quantity - invItem.count : i.quantity
      if (i.quantity > 0) returnData.push(i)
      return returnData
    }, [])
    return findItemsInChests(sharedChests, itemsToWithdraw) // busca en todos los cofres que items hay que sacar
  }

  const nearChests = () => {
    const chests = {}

    Object.entries(targets.chests).forEach((entry) => {
      const index = entry[0]
      const c = entry[1]

      if (c.dimension === bot.game.dimension && bot.entity.position.distanceTo(c.position) < 128) {
        chests[index] = c
      }
    })

    return chests
  }

  return {
    nearChests,
    findChestsToWithdraw
  }
}

export default chestModule