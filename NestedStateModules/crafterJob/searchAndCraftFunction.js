const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");

function searchAndCraftFunction(bot, targets) {
  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const transitions = [
    new StateTransition({
      parent: start,
      child: start,
     
      shouldTransition: () => false,
    }),
  ];

  const searchAndCraftFunction = new NestedStateMachine(transitions, start);
  searchAndCraftFunction.stateName = "Search and craft item";
  return searchAndCraftFunction;
}

module.exports = searchAndCraftFunction;
