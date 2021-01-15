const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorFollowEntity
} = require('mineflayer-statemachine')
const mineflayerpathfinder = require('mineflayer-pathfinder')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMoveToArray = require('./../BehaviorModules/BehaviorMoveToArray')
const BehaviorGetClosestEnemy = require('./../BehaviorModules/BehaviorGetClosestEnemy')
const BehaviorGetReadyForPatrol = require('./../BehaviorModules/BehaviorGetReadyForPatrol')
const BehaviorWithdrawItemChest = require('./../BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorDepositChest = require('./../BehaviorModules/BehaviorDepositChest')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')
const BehaviorFindItems = require('./../BehaviorModules/BehaviorFindItems')


const excludeItemsDeposit = [
  { name: 'iron_sword', quantity: 1 },
  { name: 'shield', quantity: 1 },
  { name: 'bow', quantity: 1 },
  { name: 'arrow', quantity: 256 },
  { name: 'cooked_chicken', quantity: 128 }
]

function guardJobFunction (bot, targets) {
  const { getResumeInventory } = require('../modules/inventoryModule')(bot)
  const mcData = require('minecraft-data')(bot.version)
  const movementsForAttack = new mineflayerpathfinder.Movements(bot, mcData)
  movementsForAttack.digCost = 100

  const food = 'cooked_chicken'

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

  const goEquipmentChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goEquipmentChest.stateName = 'Go Equipment Chest'

  const goFoodChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goFoodChest.stateName = 'Go Food Chest'

  const goDepositChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goDepositChest.stateName = 'Go Deposit Chest'

  const depositItems = new BehaviorDepositChest(bot, targets)
  depositItems.stateName = 'Deposit Items'

  const equip = new BehaviorEquip(bot, targets)
  const equip2 = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip items'
  equip2.stateName = 'Equip items'

  const equipmentItems = [{ item: 'helmet', quantity: 1 }, { item: 'chest', quantity: 1 }, { item: 'leggings', quantity: 1 },
    { item: 'boots', quantity: 1 }, { item: 'shield', quantity: 1 }, { item: 'sword', quantity: 1 }, { item: 'bow', quantity: 1 }]
  const getEquipments = new BehaviorWithdrawItemChest(bot, targets, equipmentItems)
  getEquipments.stateName = 'Get equipment items'

  const consumibleItems = [{ item: 'arrow', quantity: 64 }, { item: food, quantity: 64 }]
  const getConsumibles = new BehaviorWithdrawItemChest(bot, targets, consumibleItems)
  getConsumibles.stateName = 'Get Food and Arrows'

  const eatFood = new BehaviorEatFood(bot, targets, [food]) // Set array valid foods
  eatFood.stateName = 'Eat Food'

  const eatFoodCombat = new BehaviorEatFood(bot, targets, [food])
  eatFoodCombat.stateName = 'Eat Food In Combat'

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Pick up item'

  const findItem = new BehaviorFindItems(bot, targets)
  findItem.stateName = 'Find Item Dropped'

  const guardCombatJobFunction = require('./guardCombatJobFunction')(bot, targets)

  function getItemsToDeposit () {
    const items = getResumeInventory()

    const itemsToDeposit = items.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = excludeItemsDeposit.find(i => i.name === slot.name)

      if (itemToExclude === undefined) {
        newItems.push(slot)
      } else {
        slot.quantity -= itemToExclude.quantity
        if (slot.quantity > 0) {
          newItems.push(slot)
        }
      }

      return newItems
    }, [])

    return itemsToDeposit
  }

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
      parent: goToObject,
      child: guardCombatJobFunction,
      name: 'goToObject -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.onStateEntered()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: checkItemsToDeposit,
      child: goDepositChest,
      name: 'If have more than 1 item to deposit',
      onTransition: () => goDepositChest.sortPatrol(),
      shouldTransition: () => getItemsToDeposit().length > 0
    }),

    new StateTransition({
      parent: checkItemsToDeposit,
      child: getReadyForPatrol,
      name: 'No items to deposit',
      shouldTransition: () => getItemsToDeposit().length === 0
    }),

    new StateTransition({
      parent: goDepositChest,
      child: depositItems,
      name: 'goDepositChest -> depositItems',
      onTransition: () => {
        depositItems.setItemsToDeposit(getItemsToDeposit())
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
      shouldTransition: () => getReadyForPatrol.getIsReady()
    }),

    new StateTransition({
      parent: getReadyForPatrol,
      child: goEquipmentChest,
      name: 'getReadyForPatrol -> goEquipmentChest',
      onTransition: () => {
        goEquipmentChest.sortPatrol()
      },
      shouldTransition: () => !getReadyForPatrol.getIsReady()
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
      parent: guardCombatJobFunction,
      child: eatFoodCombat,
      name: 'Eat In Combat',
      shouldTransition: () => bot.health < 15 && bot.food !== 20
    }),

    new StateTransition({
      parent: eatFoodCombat,
      child: guardCombatJobFunction,
      name: 'End Eat In Combat',
      shouldTransition: () => eatFoodCombat.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: equip2,
      name: 'Continue patrol bot is full',
      shouldTransition: () => eatFood.isFinished()
    })

  ]

  const guardJobFunction = new NestedStateMachine(transitions, enter)
  guardJobFunction.stateName = 'Miner Job'
  return guardJobFunction
}

module.exports = guardJobFunction
