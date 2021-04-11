const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')

function combatStrategyFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const combatFunction = require('./combatFunction')(bot, targets)
  combatFunction.x = 125
  combatFunction.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.name = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 213

  const transitions = [

    new StateTransition({
      parent: start,
      child: combatFunction,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFood,
      shouldTransition: () => bot.health < 15 && bot.food !== 20 && eatFood.checkFoodInInventory().length > 0
    }),

    new StateTransition({
      parent: eatFood,
      child: combatFunction,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: exit,
      shouldTransition: () => combatFunction.isFinished()
    })
  ]

  const combatStrategyFunction = new NestedStateMachine(transitions, start, exit)
  combatStrategyFunction.stateName = 'Combat Strategy'
  return combatStrategyFunction
}

module.exports = combatStrategyFunction
