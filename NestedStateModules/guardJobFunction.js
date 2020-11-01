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
const BehaviorWithdrawItemChest = require('./../BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')

const mineflayerpathfinder = require('mineflayer-pathfinder')
const { getFoodChest } = require('../modules/botConfig')

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
  goChest.stateName = 'Go Equipment Chest'

  const goFoodChest = new BehaviorMoveToArray(bot, targets)
  goFoodChest.stateName = 'Go Food Chest'

  const equip = new BehaviorEquip(bot, targets)
  const equip2 = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip items'
  equip2.stateName = 'Equip items'

  const equipmentItems = [{ item: 'helmet', quantity: 1 }, { item: 'chest', quantity: 1 }, { item: 'leggings', quantity: 1 },
  { item: 'boots', quantity: 1 }, { item: 'shield', quantity: 1 }, { item: 'sword', quantity: 1 }, { item: 'bow', quantity: 1 }]
  const getEquipments = new BehaviorWithdrawItemChest(bot, targets, equipmentItems)
  getEquipments.stateName = 'Get equipment items'

  const consumibleItems = [{ item: 'arrow', quantity: 128 }, { item: 'cooked_chicken', quantity: 64 }]
  const getConsumibles = new BehaviorWithdrawItemChest(bot, targets, consumibleItems)
  getConsumibles.stateName = 'Get Food and Arrows'

  const eatFood = new BehaviorEatFood(bot, targets, ['cooked_chicken']) // Set array valid foods
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
      shouldTransition: () => patrol.isFinished()
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: eatFood,
      name: 'getReadyForPatrol -> eatFood',
      shouldTransition: () => getReadyForPatrol.getIsReady() // Yes
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: goChest,
      name: 'getReadyForPatrol -> goChest',
      onTransition: () => {
        goChest.sortPatrol()
      },
      shouldTransition: () => !getReadyForPatrol.getIsReady() // No
    }),

    new StateTransition({
      parent: goChest,
      child: getEquipments,
      name: 'goChest -> getEquipments',
      shouldTransition: () => goChest.isFinished()
    }),

    new StateTransition({
      parent: getEquipments,
      child: equip,
      name: 'getEquipments -> equip',
      shouldTransition: () => getEquipments.isFinished()
    }),

    new StateTransition({
      parent: equip,
      child: goFoodChest,
      name: 'equip -> goFoodChest',
      onTransition: () => {
        goFoodChest.sortPatrol()
      },
      shouldTransition: () => equip.isFinished()
    }),

    new StateTransition({
      parent: goFoodChest,
      child: getConsumibles,
      name: 'goFoodChest -> getConsumibles',
      shouldTransition: () => goFoodChest.isFinished()
    }),

    new StateTransition({
      parent: getConsumibles,
      child: eatFood,
      name: 'getEquipments -> eatFood',
      onTransition: () => {
        patrol.sortPatrol()
      },
      shouldTransition: () => getConsumibles.isFinished()
    }),

    new StateTransition({
      parent: guardCombatJobFunction,
      child: eatFood,
      name: 'Mob is dead',
      shouldTransition: () => guardCombatJobFunction.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: equip2,
      name: 'Continue patrol bot is full',
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: equip2,
      child: patrol,
      name: 'Continue patrol bot is full',
      shouldTransition: () => equip2.isFinished()
    }),

  ]

  const guardJobFunction = new NestedStateMachine(transitions, enter)
  guardJobFunction.stateName = 'Guard Job'
  return guardJobFunction
}

module.exports = guardJobFunction
