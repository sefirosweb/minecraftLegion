
import { Chest, Chests, Item, LegionStateMachineTargets } from "@/types"
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import _ from 'lodash'
import { Bot } from "mineflayer"

const chestModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const { findItemsInChests } = sorterJob()
  const { getResumeInventory } = inventoryModule(bot)

  const getItemsToWithdrawInChests = (InputChests: Array<Chest>): Array<Item> => {
    const chests = _.cloneDeep(InputChests)
    const items: Array<Item> = []
    chests
      .filter((c: Chest) => c.type === "withdraw")
      .forEach((c: Chest) => {
        c.items.forEach((i) => {
          const key = items.findIndex((r) => r.name === i.name);
          if (key >= 0) {
            items[key].quantity += i.quantity;
          } else {
            items.push(i);
          }
        });
      })

    return items;
  };

  const findChestsToWithdraw = (botChests: Array<Chest>, sharedChests: Chests) => {
    const resumeInventory = getResumeInventory();
    const itemsToWithdrawInChests = getItemsToWithdrawInChests(botChests);

    const itemsToWithdraw: Array<Item> = []
    itemsToWithdrawInChests.forEach(i => {
      const invItem = resumeInventory.find((inv) => inv.name === i.name);
      i.quantity = invItem ? i.quantity - invItem.quantity : i.quantity;
      if (i.quantity > 0) itemsToWithdraw.push(i);
    })

    const itemsInChest = findItemsInChests(sharedChests, itemsToWithdraw);
    return itemsInChest
  };

  const nearChests = (): Chests => { // Convert chest array to chest index and return nearest chests
    const chests: Chests = {}
    Object.entries(targets.chests).forEach((entry) => {
      const index = entry[0]
      const c = entry[1]

      if (c.dimension === bot.game.dimension && bot.entity.position.distanceTo(c.position) < 128) {
        chests[index] = c
      }
    })

    return chests;
  }
  return {
    nearChests,
    findChestsToWithdraw
  }
}

export default chestModule