const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");

function searchAndCraftFunction(bot, targets) {
  const { getItemsToPickUp } = require("@modules/craftModule")(bot);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const exit = new BehaviorIdle(targets);
  exit.stateName = "exit";
  exit.x = 125;
  exit.y = 113;

  const checkPickup = new BehaviorIdle(targets);
  checkPickup.stateName = "checkPickup";
  checkPickup.x = 125;
  checkPickup.y = 113;

  const pickUpItems = require("@NestedStateModules/getReady/pickUpItems")(
    bot,
    targets
  );
  pickUpItems.stateName = "Pick Up Items";
  pickUpItems.x = 325;
  pickUpItems.y = 50;

  let checkPickupItems;

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkPickup,
      onTransition: () => {
        checkPickupItems = getItemsToPickUp("iron_sword", targets.chests);
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: checkPickup,
      child: exit,
      shouldTransition: () => !checkPickupItems,
    }),

    new StateTransition({
      parent: checkPickup,
      child: pickUpItems,
      onTransition: () => {
        targets.pickUpItems = checkPickupItems.itemToPickup;
      },
      shouldTransition: () => checkPickupItems,
    }),

    new StateTransition({
      parent: pickUpItems,
      child: exit,
      shouldTransition: () => pickUpItems.isFinished(),
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
