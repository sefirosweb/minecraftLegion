const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorGetReady = require('@BehaviorModules/BehaviorGetReady')
const BehaviorEatFood = require('@BehaviorModules/BehaviorEatFood')

function breederJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 125
  getReady.y = 213

  const goChests = require('@NestedStateModules/getReady/goChestsFunctions')(bot, targets)
  goChests.x = 325
  goChests.y = 213

  const breeder = require('@NestedStateModules/breederFunction')(bot, targets)
  breeder.stateName = 'Breeder'
  breeder.x = 325
  breeder.y = 313

  const slaughterhouse = require('@NestedStateModules/slaughterhouseFunction')(bot, targets)
  slaughterhouse.stateName = 'Slaughterhouse'
  slaughterhouse.x = 525
  slaughterhouse.y = 313

  const findItemsAndPickup = require('@NestedStateModules/findItemsAndPickup')(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
  findItemsAndPickup.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 125
  eatFood.y = 413

  const getClosestMob = require('@modules/getClosestEnemy')(bot, targets)
  const combatStrategy = require('@NestedStateModules/combatStrategyFunction')(bot, targets)
  combatStrategy.x = 325
  combatStrategy.y = 413

  const transitions = [
    new StateTransition({
      parent: start,
      child: getReady,
      onTransition: () => {
        targets.entity = undefined
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 34
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'Go to chests',
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 34
    }),

    new StateTransition({
      parent: eatFood,
      child: breeder,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: breeder,
      child: slaughterhouse,
      shouldTransition: () => breeder.isFinished()
    }),

    new StateTransition({
      parent: slaughterhouse,
      child: findItemsAndPickup,
      shouldTransition: () => slaughterhouse.isFinished()
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: goChests,
      shouldTransition: () => findItemsAndPickup.isFinished()
    }),

    new StateTransition({
      parent: breeder,
      child: combatStrategy,
      onTransition: () => bot.pathfinder.setGoal(null),
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined && targets.entity.isEnemy === true
      }
    }),

    new StateTransition({
      parent: combatStrategy,
      child: eatFood,
      shouldTransition: () => combatStrategy.isFinished()
    })

  ]

  const breederJobFunction = new NestedStateMachine(transitions, start)
  breederJobFunction.stateName = 'Breeder Job'
  return breederJobFunction
}

module.exports = breederJobFunction
