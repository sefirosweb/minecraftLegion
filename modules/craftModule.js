module.exports = function (bot) {
  const mcData = require("minecraft-data")(bot.version);

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
            displayName: mcData.findItemOrBlockById(
              aviableRecipes[r].delta[i].id
            ).displayName,
            id: aviableRecipes[r].delta[i].id,
            count: Math.abs(aviableRecipes[r].delta[i].count),
          };
          continue;
        }
        items.push({
          displayName: mcData.findItemOrBlockById(aviableRecipes[r].delta[i].id)
            .displayName,
          id: aviableRecipes[r].delta[i].id,
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
      needCraftingTable,
      recipes: finalRecipes,
    };
  };

  const checkItemsNecesaryToCraft = (itemName) => {
    const item = mcData.findItemOrBlockByName(itemName);
    const craftingTable = getCraftingTable();
    const fullTreeRecipes = recursiveRecipes(item, craftingTable);
    console.log(fullTreeRecipes);
  };

  const getCraftingTable = () => {
    const craftingTableID = mcData.blocksByName.crafting_table.id;
    craftingTable = bot.findBlock({
      matching: craftingTableID,
      maxDistance: 3,
    });

    return craftingTable;
  };

  return {
    checkItemsNecesaryToCraft,
  };
};
