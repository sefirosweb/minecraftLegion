const botWebsocket = require('../modules/botWebsocket')

const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine

} = require('mineflayer-statemachine')
const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMoveToArray = require('./../BehaviorModules/BehaviorMoveToArray')
const BehaviorGetClosestEnemy = require('./../BehaviorModules/BehaviorGetClosestEnemy')
const BehaviorGetReadyForPatrol = require('./../BehaviorModules/BehaviorGetReadyForPatrol')
const BehaviorGetItemsAndEquip = require('./../BehaviorModules/BehaviorGetItemsAndEquip')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')

const mineflayerpathfinder = require('mineflayer-pathfinder')

function guardJobFunction(bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  const movementsForAttack = new mineflayerpathfinder.Movements(bot, mcData)
  movementsForAttack.digCost = 100

  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const patrol = new BehaviorMoveToArray(bot, targets)
  patrol.stateName = 'Patrol'

  const getClosestMob = new BehaviorGetClosestEnemy(bot, targets)

  const getReadyForPatrol = new BehaviorGetReadyForPatrol(bot, targets)
  getReadyForPatrol.stateName = 'Get Ready for Patrol'

  const goChest = new BehaviorMoveToArray(bot, targets)
  goChest.stateName = 'Go Chest'

  const goFoodChest = new BehaviorMoveToArray(bot, targets)
  goFoodChest.stateName = 'Go Food Chest'

  const getItemsAndEquip = new BehaviorGetItemsAndEquip(bot, targets)
  getItemsAndEquip.stateName = 'Get items and equip'

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'

  const guardCombatJobFunction = require('./guardCombatJobFunction')(bot, targets)

  const transitions = [
    new StateTransition({
      parent: enter,
      child: loadConfig,
      name: 'enter -> loadConfig',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: getReadyForPatrol,
      name: 'loadConfig -> patrol',
      onTransition: () => {
        targets.entity = undefined
        patrol.setPatrol(loadConfig.getPatrol(), true)
        goChest.setPatrol(loadConfig.getChest(), true)
        goFoodChest.setPatrol(loadConfig.getFoodChest(), true)
        getClosestMob.mode = loadConfig.getMode()
        getClosestMob.distance = loadConfig.getDistance()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: patrol,
      child: guardCombatJobFunction,
      name: 'patrol -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.onStateEntered()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: patrol,
      child: getReadyForPatrol,
      name: 'patrol -> getReadyForPatrol',
      shouldTransition: () => patrol.getEndPatrol()
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: eatFood,
      name: 'getReadyForPatrol -> eatFood',
      shouldTransition: () => getReadyForPatrol.getReady()
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: goChest,
      name: 'getReadyForPatrol -> goChest',
      shouldTransition: () => !getReadyForPatrol.getReady()
    }),

    new StateTransition({
      parent: goChest,
      child: getItemsAndEquip,
      name: 'goChest -> getItemsAndEquip',
      shouldTransition: () => goChest.getEndPatrol()
    }),

    new StateTransition({
      parent: getItemsAndEquip,
      child: getReadyForPatrol,
      name: 'getItemsAndEquip -> getReadyForPatrol',
      shouldTransition: () => getItemsAndEquip.getIsFinished()
    }),

    new StateTransition({
      parent: guardCombatJobFunction,
      child: eatFood,
      name: 'Mob is dead',
      shouldTransition: () => guardCombatJobFunction.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: patrol,
      name: 'Continue patrol bot is full',
      shouldTransition: () => eatFood.isFinished()
    }),

  ]

  const guardJobFunction = new NestedStateMachine(transitions, enter)
  guardJobFunction.stateName = 'Guard Job'
  return guardJobFunction
}

module.exports = guardJobFunction
