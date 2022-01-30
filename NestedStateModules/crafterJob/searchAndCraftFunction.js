const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");
const BehaviorCraft = require("@BehaviorModules/BehaviorCraft");

function searchAndCraftFunction(bot, targets) {
  const { getItemsToPickUp } = require("@modules/craftModule")(bot);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const exit = new BehaviorIdle(targets);
  exit.stateName = "exit";
  exit.x = 325;
  exit.y = 313;

  const checkPickup = new BehaviorIdle(targets);
  checkPickup.stateName = "checkPickup";
  checkPickup.x = 125;
  checkPickup.y = 413;

  const craftItem = new BehaviorCraft(bot, targets);
  craftItem.stateName = "Craft Item";
  craftItem.x = 525;
  craftItem.y = 413;

  const pickUpItems = require("@NestedStateModules/getReady/pickUpItems")(
    bot,
    targets
  );
  pickUpItems.stateName = "Pick Up Items";
  pickUpItems.x = 325;
  pickUpItems.y = 113;

  let recipes = [];

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkPickup,
      onTransition: () => {
        checkPickupItems = getItemsToPickUp("iron_sword", targets.chests);
        targets.pickUpItems = checkPickupItems
          ? checkPickupItems.itemToPickup
          : false;
        recipes = checkPickupItems ? checkPickupItems.repicesUsed : [];
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: checkPickup,
      child: exit,
      shouldTransition: () => {
        !targets.pickUpItems && targets.pickUpItems.length === 0;
      },
    }),

    new StateTransition({
      parent: checkPickup,
      child: craftItem,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift().result.name,
        };
      },
      shouldTransition: () =>
        targets.pickUpItems && targets.pickUpItems.length === 0,
    }),

    new StateTransition({
      parent: checkPickup,
      child: pickUpItems,
      shouldTransition: () =>
        targets.pickUpItems && targets.pickUpItems.length > 0,
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
