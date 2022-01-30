const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");
const { Vec3 } = require("vec3");

function crafterJobFunction(bot, targets) {
  const { getResumeInventory } = require("@modules/inventoryModule")(bot);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";

  const exit = new BehaviorIdle(targets);
  exit.stateName = "exit";

  const searchAndCraft =
    require("@NestedStateModules/crafterJob/searchAndCraftFunction")(
      bot,
      targets
    );

  const goAndDeposit = require("@NestedStateModules/getReady/goAndDeposit")(
    bot,
    targets
  );
  goAndDeposit.stateName = "Go chest and Deposit";

  const transitions = [
    new StateTransition({
      parent: start,
      child: searchAndCraft,
      onTransition: () => {
        targets.craftItemBatch = {
          name: "iron_sword",
          quantity: 5,
        };
      },
      shouldTransition: () => true,
    }),
    new StateTransition({
      parent: searchAndCraft,
      child: goAndDeposit,
      onTransition: () => {
        targets.position = new Vec3(-233, 64, -40);
        const items = getResumeInventory();
        targets.items = items;
      },
      shouldTransition: () => searchAndCraft.isFinished(),
    }),
    new StateTransition({
      parent: goAndDeposit,
      child: exit,
      shouldTransition: () => false,
    }),
  ];

  const crafterJobFunction = new NestedStateMachine(transitions, start);
  crafterJobFunction.stateName = "Crafter Job";
  return crafterJobFunction;
}

module.exports = crafterJobFunction;
