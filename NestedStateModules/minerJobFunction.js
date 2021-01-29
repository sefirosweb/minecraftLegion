const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMoveToArray = require('./../BehaviorModules/BehaviorMoveToArray')
const BehaviorGetClosestEnemy = require('./../BehaviorModules/BehaviorGetClosestEnemy')
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')
const BehaviorWithdrawItemChest = require('./../BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorDepositChest = require('./../BehaviorModules/BehaviorDepositChest')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')

// Exclude items to deposit
const excludeItemsDeposit = [
  { item: 'iron_sword', quantity: 1 }, // Danger user iron_XXX
  { item: 'iron_pickaxe', quantity: 4 },
  { item: 'iron_shovel', quantity: 4 },
  { item: 'diamond_sword', quantity: 1 }, // Danger user iron_XXX
  { item: 'diamond_pickaxe', quantity: 4 },
  { item: 'diamond_shovel', quantity: 4 },
  { item: 'shield', quantity: 1 },
  { item: 'bow', quantity: 1 },
  { item: 'arrow', quantity: 128 },
  { item: 'cooked_chicken', quantity: 64 },
  { item: 'cobblestone', quantity: 64 }
]

// Check this items in inventory for go withdraw
const itemsToBeReady = [
  { item: 'pickaxe', quantity: 1 },
  { item: 'shovel', quantity: 1 },
  { item: 'helmet', quantity: 1 },
  { item: 'chest', quantity: 1 },
  { item: 'leggings', quantity: 1 },
  { item: 'boots', quantity: 1 },
  { item: 'shield', quantity: 1 },
  { item: 'sword', quantity: 1 },
  { item: 'bow', quantity: 1 },
  { item: 'arrow', quantity: 16 },
  { item: 'cooked_chicken', quantity: 16 }
]

// BehaviorWithdrawItemChest 1
const equipmentItems = [
  { item: 'helmet', quantity: 1 },
  { item: 'chest', quantity: 1 },
  { item: 'leggings', quantity: 1 },
  { item: 'boots', quantity: 1 },
  { item: 'shield', quantity: 1 },
  { item: 'sword', quantity: 1 },
  { item: 'bow', quantity: 1 }
]

// BehaviorWithdrawItemChest 2
const consumibleItems = [
  { item: 'arrow', quantity: 64 },
  { item: 'cooked_chicken', quantity: 64 }
]

// BehaviorWithdrawItemChest 3
const pickaxe = [
  { item: 'pickaxe', quantity: 4 }
]

// BehaviorWithdrawItemChest 4
const shovel = [
  { item: 'shovel', quantity: 4 }
]

const validFood = ['cooked_chicken']

function minerJobFunction (bot, targets) {
  const { getResumeInventory } = require('../modules/inventoryModule')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const goEquipmentChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goEquipmentChest.stateName = 'Go Equipment Chest'
  goEquipmentChest.x = 725
  goEquipmentChest.y = 113

  const goFoodChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goFoodChest.stateName = 'Go Food Chest'
  goFoodChest.x = 1125
  goFoodChest.y = 213

  const goPickChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goPickChest.stateName = 'Go Pick Chest'
  goPickChest.x = 1125
  goPickChest.y = 413

  const goShovelChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goShovelChest.stateName = 'Go Shovel Chest'
  goShovelChest.x = 925
  goShovelChest.y = 313

  const goDepositChest = new BehaviorMoveToArray(bot, targets, [], true, 1)
  goDepositChest.stateName = 'Go Deposit Chest'
  goDepositChest.x = 225
  goDepositChest.y = 513

  const getClosestMob = new BehaviorGetClosestEnemy(bot, targets)

  const getEquipments = new BehaviorWithdrawItemChest(bot, targets, equipmentItems)
  getEquipments.stateName = 'Get equipment items'
  getEquipments.x = 925
  getEquipments.y = 113

  const getConsumibles = new BehaviorWithdrawItemChest(bot, targets, consumibleItems)
  getConsumibles.stateName = 'Get Food and Arrows'
  getConsumibles.x = 1125
  getConsumibles.y = 313

  const getPicks = new BehaviorWithdrawItemChest(bot, targets, pickaxe)
  getPicks.stateName = 'Get Pickaxes'
  getPicks.x = 925
  getPicks.y = 413

  const getShovels = new BehaviorWithdrawItemChest(bot, targets, shovel)
  getShovels.stateName = 'Get Shovels'
  getShovels.x = 725
  getShovels.y = 213

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip Armor'
  equip.x = 1125
  equip.y = 113

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Mining'
  getReady.x = 525
  getReady.y = 113
  getReady.itemsToBeReady = itemsToBeReady

  const eatFood = new BehaviorEatFood(bot, targets, validFood)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 525
  eatFood.y = 313

  const eatFoodCombat = new BehaviorEatFood(bot, targets, validFood)
  eatFoodCombat.stateName = 'Eat Food In Combat'
  eatFoodCombat.x = 825
  eatFoodCombat.y = 513

  const depositItems = new BehaviorDepositChest(bot, targets)
  depositItems.stateName = 'Deposit Items'
  depositItems.x = 225
  depositItems.y = 313

  function getItemsToDeposit () {
    const items = getResumeInventory()

    const itemsToDeposit = items.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = excludeItemsDeposit.find(i => {
        return i.item === slot.name
      })

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

  const miningFunction = require('./miningFunction')(bot, targets)
  miningFunction.x = 425
  miningFunction.y = 513

  const combatFunction = require('./combatFunction')(bot, targets)
  combatFunction.x = 625
  combatFunction.y = 513

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: getReady,
      name: 'loadConfig -> patrol',
      onTransition: () => {
        targets.entity = undefined

        goEquipmentChest.setPatrol(loadConfig.getChest('equipment'), true)
        goDepositChest.setPatrol(loadConfig.getChest('deposit'), true)
        goFoodChest.setPatrol(loadConfig.getChest('food'), true)
        goPickChest.setPatrol(loadConfig.getChest('picks'), true)
        goShovelChest.setPatrol(loadConfig.getChest('shovels'), true)

        getClosestMob.mode = loadConfig.getMode()
        getClosestMob.distance = loadConfig.getDistance()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getReady,
      child: goEquipmentChest,
      name: 'getReady -> goEquipmentChest',
      onTransition: () => {
        goEquipmentChest.sortPatrol()
      },
      shouldTransition: () => !getReady.getIsReady()
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
      child: goPickChest,
      name: 'getConsumibles -> goPickChest',
      onTransition: () => {
        goPickChest.sortPatrol()
      },
      shouldTransition: () => getConsumibles.isFinished()
    }),

    new StateTransition({
      parent: goPickChest,
      child: getPicks,
      name: 'goPickChest -> getPicks',
      shouldTransition: () => goPickChest.isFinished()
    }),

    new StateTransition({
      parent: getPicks,
      child: goShovelChest,
      name: 'getPicks -> goShovelChest',
      onTransition: () => {
        goShovelChest.sortPatrol()
      },
      shouldTransition: () => getPicks.isFinished()
    }),

    new StateTransition({
      parent: goShovelChest,
      child: getShovels,
      name: 'goShovelChest -> getShovels',
      shouldTransition: () => goShovelChest.isFinished()
    }),

    new StateTransition({
      parent: getShovels,
      child: eatFood,
      name: 'getEquipments -> eatFood',
      shouldTransition: () => getShovels.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      name: 'getReady -> eatFood',
      shouldTransition: () => getReady.getIsReady()
    }),

    new StateTransition({
      parent: eatFood,
      child: miningFunction,
      name: 'Continue Mining',
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: goDepositChest,
      name: 'Return to base',
      onTransition: () => goDepositChest.sortPatrol(),
      shouldTransition: () => miningFunction.isFinished()
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
      child: getReady,
      name: 'depositItems -> getReady',
      shouldTransition: () => depositItems.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: combatFunction,
      name: 'miningFunction -> try getClosestMob',
      onTransition: () => bot.pathfinder.setGoal(null),
      shouldTransition: () => {
        getClosestMob.onStateEntered()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFood,
      name: 'Mob is dead',
      shouldTransition: () => combatFunction.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFoodCombat,
      name: 'Eat In Combat',
      shouldTransition: () => bot.health < 15 && bot.food !== 20
    }),

    new StateTransition({
      parent: eatFoodCombat,
      child: combatFunction,
      name: 'End Eat In Combat',
      shouldTransition: () => eatFoodCombat.isFinished()
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, start)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
