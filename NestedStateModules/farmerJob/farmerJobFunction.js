const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorGetReady = require('@BehaviorModules/BehaviorGetReady')
const BehaviorEatFood = require('@BehaviorModules/BehaviorEatFood')

function farmerJobFunction (bot, targets) {
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

  const farming = require('@NestedStateModules/farmerJob/farmingFunction')(bot, targets)
  farming.stateName = 'Farming'
  farming.x = 325
  farming.y = 313

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
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 33
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
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 33
    }),

    new StateTransition({
      parent: eatFood,
      child: farming,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: farming,
      child: goChests,
      shouldTransition: () => farming.isFinished()
    }),

    new StateTransition({
      parent: farming,
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

  const farmerJobFunction = new NestedStateMachine(transitions, start)
  farmerJobFunction.stateName = 'Farmer Job'
  return farmerJobFunction
}

module.exports = farmerJobFunction
