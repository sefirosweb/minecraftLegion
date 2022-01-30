const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");
const BehaviorCraft = require("@BehaviorModules/BehaviorCraft");
const BehaviorMoveTo = require("@BehaviorModules/BehaviorMoveTo");

function searchAndCraftFunction(bot, targets) {
  const { getItemsToPickUp } = require("@modules/craftModule")(bot);
  const mcData = require("minecraft-data")(bot.version);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const exit = new BehaviorIdle(targets);
  exit.stateName = "exit";
  exit.x = 125;
  exit.y = 713;

  const goTable = new BehaviorMoveTo(bot, targets);
  goTable.stateName = "Go crafting table";
  goTable.movements = targets.movements;
  goTable.x = 550;
  goTable.y = 450;

  const checkRecipes = new BehaviorIdle(targets);
  checkRecipes.stateName = "checkRecipes";
  checkRecipes.x = 650;
  checkRecipes.y = 113;

  const checkRecipesWithTable = new BehaviorIdle(targets);
  checkRecipesWithTable.stateName = "checkRecipesWithTable";
  checkRecipesWithTable.x = 350;
  checkRecipesWithTable.y = 575;

  const checkMaterials = new BehaviorIdle(targets);
  checkMaterials.stateName = "checkMaterials";
  checkMaterials.x = 355;
  checkMaterials.y = 375;

  const checkPickUpItems = new BehaviorIdle(targets);
  checkPickUpItems.stateName = "checkPickUpItems";
  checkPickUpItems.x = 350;
  checkPickUpItems.y = 213;

  const checkCraftingTable = new BehaviorIdle(targets);
  checkCraftingTable.stateName = "checkCraftingTable";
  checkCraftingTable.x = 650;
  checkCraftingTable.y = 713;

  const craftItem = new BehaviorCraft(bot, targets);
  craftItem.stateName = "Craft Item";
  craftItem.x = 125;
  craftItem.y = 375;

  const pickUpItems = require("@NestedStateModules/getReady/pickUpItems")(
    bot,
    targets
  );
  pickUpItems.stateName = "Pick Up Items";
  pickUpItems.x = 125;
  pickUpItems.y = 213;

  let recipes = [];
  let checkPickupItems;
  let craftingTable;

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkRecipes,
      onTransition: () => {
        checkPickupItems = getItemsToPickUp("iron_sword", targets.chests);
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: checkRecipes,
      child: checkMaterials,
      onTransition: () => {
        recipes = checkPickupItems.repicesUsed;
      },
      shouldTransition: () => checkPickupItems.recipesFound,
    }),

    new StateTransition({
      parent: checkMaterials,
      child: exit,
      shouldTransition: () => !checkPickupItems.haveMaterials,
    }),

    new StateTransition({
      parent: checkMaterials,
      child: checkPickUpItems,
      onTransition: () => {
        targets.pickUpItems = checkPickupItems.itemToPickup;
      },
      shouldTransition: () => checkPickupItems.haveMaterials,
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: craftItem,
      shouldTransition: () => targets.pickUpItems.length === 0,
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: pickUpItems,
      shouldTransition: () => targets.pickUpItems.length > 0,
    }),

    new StateTransition({
      parent: pickUpItems,
      child: craftItem,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift().result.name,
        };
      },
      shouldTransition: () => pickUpItems.isFinished(),
    }),

    new StateTransition({
      parent: craftItem,
      child: craftItem,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift().result.name,
        };
      },
      shouldTransition: () => recipes.length > 0 && craftItem.isFinished(),
    }),

    new StateTransition({
      parent: craftItem,
      child: exit,
      shouldTransition: () => recipes.length === 0 && craftItem.isFinished(),
    }),

    new StateTransition({
      parent: checkRecipes,
      child: checkCraftingTable,
      onTransition: () => {
        const craftingTableID = mcData.blocksByName.crafting_table.id;
        craftingTable = bot.findBlock({
          matching: craftingTableID,
          maxDistance: 15,
        });
      },
      shouldTransition: () => !checkPickupItems.recipesFound,
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: exit,
      shouldTransition: () => !craftingTable,
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: goTable,
      onTransition: () => {
        targets.position = craftingTable.position;
      },
      shouldTransition: () => craftingTable,
    }),

    new StateTransition({
      parent: goTable,
      child: checkRecipesWithTable,
      onTransition: () => {
        checkPickupItems = getItemsToPickUp("iron_sword", targets.chests);
      },
      shouldTransition: () =>
        (goTable.isFinished() || goTable.distanceToTarget() < 1) &&
        !goTable.isSuccess() &&
        !bot.pathfinder.isMining(),
    }),

    new StateTransition({
      parent: checkRecipesWithTable,
      child: exit,
      shouldTransition: () => !checkPickupItems.recipesFound,
    }),

    new StateTransition({
      parent: checkRecipesWithTable,
      child: checkMaterials,
      onTransition: () => {
        recipes = checkPickupItems.repicesUsed;
      },
      shouldTransition: () => checkPickupItems.recipesFound,
    }),
  ];

  const searchAndCraftFunction = new NestedStateMachine(
    transitions,
    start,
    exit
  );
  searchAndCraftFunction.stateName = "Search and craft item";
  return searchAndCraftFunction;
}

module.exports = searchAndCraftFunction;
