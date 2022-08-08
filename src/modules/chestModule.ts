import { Bot, Chests, DepositType, Item, LegionStateMachineTargets, ResumeChests, Vec3WithDimension } from "@/types"
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'

export type Chest = {
  items: Array<Item>
  type: DepositType
  name: string
  position: Vec3WithDimension
};

const chestModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const { findItemsInChests } = sorterJob(bot)
  const { getResumeInventoryV2, getGenericItems } = inventoryModule(bot)

  const getItemsToWithdrawInChests = (chests: Array<Chest>): Array<Item> => {
    const items: Array<Item> = []
    chests
      .filter((c) => c.type === "withdraw")
      .forEach(c => {
        c.items.forEach((i) => {
          const key = items.findIndex((r) => r.item === i.item);
          if (key >= 0) {
            items[key].quantity += i.quantity;
          } else {
            items.push(i);
          }
        });
      })

    return items;
  };

  const findChestsToWithdraw = (botChests: Array<Chest>, sharedChests: ResumeChests) => {
    const resumeInventory = getResumeInventoryV2();
    const itemsToWithdrawInChests = getItemsToWithdrawInChests(botChests);

    const itemsToWithdraw: Array<Item> = []
    itemsToWithdrawInChests.forEach(i => {
      let invItem;
      if (getGenericItems().includes(i.item)) {
        invItem = resumeInventory.find((inv) => inv.name.includes(i.item));
      } else {
        invItem = resumeInventory.find((inv) => inv.name === i.item);
      }
      i.quantity = invItem ? i.quantity - invItem.count : i.quantity;
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