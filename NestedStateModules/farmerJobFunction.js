const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')

function farmerJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Patrol'
  getReady.x = 525
  getReady.y = 113

  const goChests = require('./goChestsFunctions')(bot, targets)
  goChests.x = 325
  goChests.y = 313

  const farming = require('./farmingFunction')(bot, targets)
  farming.stateName = 'Farming'
  farming.x = 728
  farming.y = 113

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: getReady,
      name: 'Loading configuration',
      onTransition: () => {
        targets.entity = undefined

        // movements.allowSprinting = loadConfig.getAllowSprinting(bot.username)
        // movements.canDig = loadConfig.getCanDig(bot.username)

        getReady.setItemsToBeReady(loadConfig.getItemsToBeReady())
        // eatFood.setFoods(loadConfig.getItemsCanBeEat())
        // eatFoodCombat.setFoods(loadConfig.getItemsCanBeEat())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'Go to chests',
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 34
    }),

    new StateTransition({
      parent: getReady,
      child: farming,
      name: 'Start Job',
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 34
    })
  ]

  const farmerJobFunction = new NestedStateMachine(transitions, start)
  farmerJobFunction.stateName = 'Farmer Job'
  return farmerJobFunction
}

module.exports = farmerJobFunction
