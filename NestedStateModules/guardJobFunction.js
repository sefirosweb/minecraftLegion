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
const BehaviorDepositChest = require('./../BehaviorModules/BehaviorDepositChest')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')

const mineflayerpathfinder = require('mineflayer-pathfinder')
const { getFoodChest } = require('../modules/botConfig')

const excludeItemsDeposit = [
  'iron_sword',
  'bow',
  'arrow',
  'cooked_chicken'
]

function guardJobFunction(bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  const movementsForAttack = new mineflayerpathfinder.Movements(bot, mcData)
  movementsForAttack.digCost = 100

  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const checkItemsToDeposit = new BehaviorIdle(targets)
  checkItemsToDeposit.stateName = 'Verify Items To Deposit'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const patrol = new BehaviorMoveToArray(bot, targets)
  patrol.stateName = 'Patrol'

  const getClosestMob = new BehaviorGetClosestEnemy(bot, targets)

  const getReadyForPatrol = new BehaviorGetReadyForPatrol(bot, targets)
  getReadyForPatrol.stateName = 'Get Ready for Patrol'

  const goEquipmentChest = new BehaviorMoveToArray(bot, targets)
  goEquipmentChest.stateName = 'Go Equipment Chest'

  const depositItems = new BehaviorDepositChest(bot, targets)
  depositItems.stateName = 'Deposit Items'

  const goFoodChest = new BehaviorMoveToArray(bot, targets)
  goFoodChest.stateName = 'Go Food Chest'

  const goDepositChest = new BehaviorMoveToArray(bot, targets)
  goDepositChest.stateName = 'Go Deposit Chest'

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
        goEquipmentChest.setPatrol(loadConfig.getEquipmentChest(), true)
        goFoodChest.setPatrol(loadConfig.getFoodChest(), true)
        goDepositChest.setPatrol(loadConfig.getDepositChest(), true)
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
      child: checkItemsToDeposit,
      name: 'patrol -> checkItemsToDeposit',
      shouldTransition: () => patrol.isFinished()
    }),

    new StateTransition({
      parent: checkItemsToDeposit,
      child: goDepositChest,
      name: 'checkItemsToDeposit -> goDepositChest',
      onTransition: () => goDepositChest.sortPatrol(),
      shouldTransition: () => {
        const itemsToDeposit = bot.inventory.items().filter(item => !excludeItemsDeposit.includes(item.name))
        if (itemsToDeposit.length > 0) {
          return true
        }
      }
    }),

    new StateTransition({
      parent: checkItemsToDeposit,
      child: getReadyForPatrol,
      name: 'checkItemsToDeposit -> getReadyForPatrol',
      shouldTransition: () => {
        const itemsToDeposit = bot.inventory.items().filter(item => !excludeItemsDeposit.includes(item.name))
        if (itemsToDeposit.length === 0) {
          return true
        }
      }
    }),

    new StateTransition({
      parent: goDepositChest,
      child: depositItems,
      name: 'goDepositChest -> depositItems',
      onTransition: () => {
        const itemsToDeposit = bot.inventory.items().filter(item => !excludeItemsDeposit.includes(item.name))
        depositItems.setItemsToDeposit(itemsToDeposit)
      },
      shouldTransition: () => goDepositChest.isFinished()
    }),

    new StateTransition({
      parent: depositItems,
      child: getReadyForPatrol,
      name: 'depositItems -> getReadyForPatrol',
      shouldTransition: () => depositItems.isFinished()
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: eatFood,
      name: 'getReadyForPatrol -> eatFood',
      shouldTransition: () => getReadyForPatrol.getIsReady() // Yes
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: goEquipmentChest,
      name: 'getReadyForPatrol -> goEquipmentChest',
      onTransition: () => {
        goEquipmentChest.sortPatrol()
      },
      shouldTransition: () => !getReadyForPatrol.getIsReady() // No
    }),

    new StateTransition({
      parent: goEquipmentChest,
      child: getEquipments,
      name: 'goEquipmentChest -> getEquipments',
      shouldTransition: () => goEquipmentChest.isFinished()
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
