module.exports = function (bot, targets) {
  const { findItemsInChests } = require("@modules/sorterJob")(bot);
  const { getResumeInventory, getGenericItems } =
    require("@modules/inventoryModule")(bot);

  const getItemsToWithdrawInChests = (chests) => {
    return chests
      .filter((c) => c.type === "withdraw")
      .reduce((returnData, c) => {
        c.items.forEach((i) => {
          const key = returnData.findIndex((r) => r.item === i.item);
          if (key >= 0) {
            returnData[key].quantity += i.quantity;
          } else {
            returnData.push(i);
          }
        });
        return returnData;
      }, []);
  };

  const findChestsToWithdraw = (botChests, sharedChests) => {
    const resumeInventory = getResumeInventory();
    const itemsToWithdrawInChests = getItemsToWithdrawInChests(botChests); // bsca que items hay que sacar
    const itemsToWithdraw = itemsToWithdrawInChests.reduce((returnData, i) => {
      // resta los items que hay que sacar - inventario
      let invItem;
      if (getGenericItems().includes(i.item)) {
        invItem = resumeInventory.find((inv) => inv.name.includes(i.item));
      } else {
        invItem = resumeInventory.find((inv) => inv.name === i.item);
      }
      i.quantity = invItem ? i.quantity - invItem.quantity : i.quantity;
      if (i.quantity > 0) returnData.push(i);
      return returnData;
    }, []);
    return findItemsInChests(sharedChests, itemsToWithdraw); // busca en todos los cofres que items hay que sacar
  };

  const nearChests = () => {
    return targets.chests.filter(c => {
      return c.dimension === bot.game.dimension && bot.entity.position.distanceTo(c.position) < 128
    })
  }

  return {
    nearChests,
    findChestsToWithdraw,
  };
};
