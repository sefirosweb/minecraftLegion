const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");
const BehaviorCraft = require("@BehaviorModules/BehaviorCraft");
const BehaviorMoveTo = require("@BehaviorModules/BehaviorMoveTo");

function searchAndCraftFunction(bot, targets) {
  const { getItemsToPickUp } = require("@modules/craftModule")(bot);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const exit = new BehaviorIdle(targets);
  exit.stateName = "exit";
  exit.x = 125;
  exit.y = 713;

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

  const goTable =
    require("@NestedStateModules/crafterJob/goCraftingTableFunction")(
      bot,
      targets
    );
  goTable.stateName = "Go check recipes";
  goTable.x = 550;
  goTable.y = 450;

  const goTableToCraft =
    require("@NestedStateModules/crafterJob/goCraftingTableFunction")(
      bot,
      targets
    );
  goTableToCraft.stateName = "Go to Craft";
  goTableToCraft.x = 550;
  goTableToCraft.y = 450;

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
      child: checkCraftingTable,
      shouldTransition: () => targets.pickUpItems.length === 0,
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: pickUpItems,
      shouldTransition: () => targets.pickUpItems.length > 0,
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: craftItem,
      shouldTransition: () => !checkPickupItems.needCraftingTable,
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: goTableToCraft,
      shouldTransition: () => checkPickupItems.needCraftingTable,
    }),

    new StateTransition({
      parent: goTableToCraft,
      child: craftItem,
      shouldTransition: () =>
        checkPickupItems.needCraftingTable && goTableToCraft.isFinished(),
    }),

    new StateTransition({
      parent: pickUpItems,
      child: checkCraftingTable,
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
      child: goTable,
      shouldTransition: () => !checkPickupItems.recipesFound,
    }),

    // new StateTransition({
    //   parent: goTable,
    //   child: exit,
    //   shouldTransition: () => goTable.isFinished() && !goTable.craftingTable,
    // }),

    new StateTransition({
      parent: goTable,
      child: checkRecipesWithTable,
      onTransition: () => {
        checkPickupItems = getItemsToPickUp("iron_sword", targets.chests);
      },
      shouldTransition: () => goTable.isFinished(),
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
