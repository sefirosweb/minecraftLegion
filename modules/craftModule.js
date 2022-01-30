module.exports = function (bot) {
  const mcData = require("minecraft-data")(bot.version);
  const { getResumeInventory } = require("@modules/inventoryModule")(bot);
  const { findItemsInChests } = require("@modules/sorterJob")(bot);

  const getRecipes = (item, craftingTable) => {
    const aviableRecipes = bot.recipesAll(item.id, null, craftingTable);

    const recipes = [];

    // Recpipes
    for (let r = 0; r < aviableRecipes.length; r++) {
      // Items in recipe
      let items = [];
      let result = null;
      for (let i = 0; i < aviableRecipes[r].delta.length; i++) {
        if (aviableRecipes[r].delta[i].count > 0) {
          result = {
            name: mcData.findItemOrBlockById(aviableRecipes[r].delta[i].id)
              .name,
            id: aviableRecipes[r].delta[i].id,
            type: aviableRecipes[r].delta[i].id,
            count: Math.abs(aviableRecipes[r].delta[i].count),
          };
          continue;
        }
        items.push({
          name: mcData.findItemOrBlockById(aviableRecipes[r].delta[i].id).name,
          id: aviableRecipes[r].delta[i].id,
          type: aviableRecipes[r].delta[i].id,
          count: Math.abs(aviableRecipes[r].delta[i].count),
        });
      }

      recipes.push({
        result,
        items,
      });
    }

    return recipes;
  };

  const recursiveRecipes = (item, craftingTable, previousItem) => {
    let needCraftingTable = false;
    let subItem,
      subRecipe,
      subRecipes = [];
    let recipes = getRecipes(item, null);

    if (recipes.length === 0 && craftingTable) {
      needCraftingTable = true;
      recipes = getRecipes(item, craftingTable);
    }

    const itemsToRemove = [];
    for (let r = 0; r < recipes.length; r++) {
      recipes[r].needCraftingTable = needCraftingTable;

      for (let i = 0; i < recipes[r].items.length; i++) {
        subItem = mcData.findItemOrBlockById(recipes[r].items[i].id);
        if (previousItem && subItem.id === previousItem.id) {
          itemsToRemove.push(r);
          continue;
        }
        recipes[r].items[i].subRecipes = recursiveRecipes(
          subItem,
          craftingTable,
          item
        );
      }
    }

    const finalRecipes = recipes.filter((value, index, arr) => {
      return !itemsToRemove.includes(index);
    });

    return {
      recipes: finalRecipes,
    };
  };

  const getFullTreeCraftToItem = (itemName) => {
    const item = mcData.findItemOrBlockByName(itemName);
    const craftingTable = getCraftingTable();
    return recursiveRecipes(item, craftingTable);
  };

  const getCraftingTable = () => {
    const craftingTableID = mcData.blocksByName.crafting_table.id;
    craftingTable = bot.findBlock({
      matching: craftingTableID,
      maxDistance: 3,
    });

    return craftingTable;
  };

  const getItemsToPickUp = (itemName, sharedChests, quantity) => {
    const fullTreeCraftToItem = getFullTreeCraftToItem(itemName);

    if (fullTreeCraftToItem.recipes.length === 0) {
      return {
        recipesFound: false,
      };
    }

    const resumeInventory = getResumeInventory();
    const resultItemToPickup = getItemsToPickUpRecursive(
      resumeInventory,
      fullTreeCraftToItem,
      sharedChests,
      [],
      []
    );

    if (!resultItemToPickup) {
      return {
        recipesFound: true,
        haveMaterials: false,
      };
    }

    const needCraftingTable = checkCraftingTableNeeded(
      resultItemToPickup.repicesUsed
    );

    return {
      recipesFound: true,
      haveMaterials: true,
      needCraftingTable: needCraftingTable,
      itemToPickup: resultItemToPickup.itemToPickup,
      repicesUsed: resultItemToPickup.repicesUsed,
    };
  };

  const checkCraftingTableNeeded = (recipes) => {
    let craftinTableNeeded = false;

    for (let r = 0; r < recipes.length; r++) {
      const recipe = recipes[r];
      if (recipe.needCraftingTable) {
        return true;
      }

      for (let i = 0; i < recipe.items.length; i++) {
        const item = recipe.items[i];

        if (checkCraftingTableNeeded(item.subRecipes)) {
          return true;
        }
      }
    }

    return false;
  };

  const getItemsToPickUpRecursive = (
    InputCurrentInventoryStatus,
    inputTreeCraftToItem,
    InputSharedChests,
    InputItemToPickup,
    InputRepicesUsed
  ) => {
    const treeCraftToItem = JSON.parse(JSON.stringify(inputTreeCraftToItem));

    let haveAllItems, recipe, item;

    for (let r = 0; r < treeCraftToItem.recipes.length; r++) {
      recipe = treeCraftToItem.recipes[r];

      let currentInventoryStatus = JSON.parse(
        JSON.stringify(InputCurrentInventoryStatus)
      );
      let sharedChests = JSON.parse(JSON.stringify(InputSharedChests));
      let itemToPickup = JSON.parse(JSON.stringify(InputItemToPickup));
      let repicesUsed = JSON.parse(JSON.stringify(InputRepicesUsed));

      haveAllItems = true;

      for (let i = 0; i < recipe.items.length; i++) {
        item = recipe.items[i];

        const invItem = currentInventoryStatus.find(
          (inv) => inv.type === item.type
        );

        if (invItem) {
          const itemToDiscount =
            invItem.quantity > item.count ? item.count : invItem.quantity;

          item.count -= itemToDiscount;
          invItem.quantity -= itemToDiscount;
        }

        if (item.count > 0) {
          const itemsInChests = findItemsInChests(sharedChests, [item]);

          itemsInChests.every((itemsInChest) => {
            if (item.count === 0) return false;

            itemsInChest.quantity =
              itemsInChest.quantity > item.count
                ? item.count
                : itemsInChest.quantity;

            item.count -= itemsInChest.quantity;
            sharedChests[itemsInChest.fromChest].slots[
              itemsInChest.fromSlot
            ].count -= itemsInChest.quantity;

            itemToPickup.push(itemsInChest);
            return true;
          });

          if (item.count > 0) {
            const itemsPickupRecursive = getItemsToPickUpRecursive(
              currentInventoryStatus,
              item.subRecipes,
              sharedChests,
              itemToPickup,
              repicesUsed
            );

            if (itemsPickupRecursive) {
              itemToPickup = itemsPickupRecursive.itemToPickup;
              repicesUsed = itemsPickupRecursive.repicesUsed;
              sharedChests = itemsPickupRecursive.sharedChests;
              currentInventoryStatus =
                itemsPickupRecursive.currentInventoryStatus;

              itemsPickupRecursive.recipedUsed.result.count -= item.count;
              const spareItem = itemsPickupRecursive.recipedUsed.result;
              item.count = 0;

              if (spareItem.count > 0) {
                const itemInventory = currentInventoryStatus.find(
                  (i) => i.type === spareItem.type
                );

                if (itemInventory) {
                  itemInventory.count += spareItem.count;
                } else {
                  currentInventoryStatus.push(spareItem);
                }
              }
            }
          }

          if (item.count > 0) {
            haveAllItems = false;
          }
        }
      }

      if (haveAllItems) {
        repicesUsed.push(recipe);
        return {
          itemToPickup,
          currentInventoryStatus,
          sharedChests,
          repicesUsed,
          recipedUsed: recipe,
        };
      }
    }

    return false;
  };

  return {
    getItemsToPickUp,
    getFullTreeCraftToItem,
    getCraftingTable,
  };
};
