// const botWebsocket = require('../modules/botWebsocket')

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
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')
const BehaviorWithdrawItemChest = require('./../BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorDepositChest = require('./../BehaviorModules/BehaviorDepositChest')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')
const BehaviorFindItems = require('./../BehaviorModules/BehaviorFindItems')
const BehaviorHelpFriend = require('./../BehaviorModules/BehaviorHelpFriend')

// Exclude items to deposit
const excludeItemsDeposit = [
  { item: 'iron_sword', quantity: 1 },
  { item: 'shield', quantity: 1 },
  { item: 'bow', quantity: 1 },
  { item: 'arrow', quantity: 128 },
  { item: 'cooked_chicken', quantity: 64 }
]

// Check this items in inventory for go withdraw
const itemsToBeReady = [
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

function guardJobFunction(bot, targets) {
  const { getResumeInventory } = require('../modules/inventoryModule')(bot)
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

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Patrol'
  getReady.itemsToBeReady = itemsToBeReady

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

  const getEquipments = new BehaviorWithdrawItemChest(bot, targets, equipmentItems)
  getEquipments.stateName = 'Get equipment items'

  const getConsumibles = new BehaviorWithdrawItemChest(bot, targets, consumibleItems)
  getConsumibles.stateName = 'Get Food and Arrows'

  const eatFood = new BehaviorEatFood(bot, targets, ['cooked_chicken']) // Set array valid foods
  eatFood.stateName = 'Eat Food'

  const eatFoodCombat = new BehaviorEatFood(bot, targets, ['cooked_chicken'])
  eatFoodCombat.stateName = 'Eat Food In Combat'

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Pick up item'

  const findItem = new BehaviorFindItems(bot, targets)
  findItem.stateName = 'Find Item Dropped'

  const helpFriend = new BehaviorHelpFriend(bot, targets, true)
  helpFriend.stateName = 'Check friend needs help'

  const goFriend = new BehaviorFollowEntity(bot, targets)
  goFriend.stateName = 'Go To Help Friend'

  const guardCombatJobFunction = require('./guardCombatJobFunction')(bot, targets)

  function getItemsToDeposit() {
    const items = getResumeInventory()

    const itemsToDeposit = items.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = excludeItemsDeposit.find(i => i.item === slot.name)

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
      child: getReady,
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
      parent: goToObject,
      child: guardCombatJobFunction,
      name: 'goToObject -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.onStateEntered()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: patrol,
      child: goToObject,
      name: 'patrol -> goToObject',
      // onTransition: () => botWebsocket.log('Item Found => ' + JSON.stringify(findItem.targets.itemDrop)),
      shouldTransition: () => findItem.search() && findItem.checkInventorySpace() > 3
    }),

    new StateTransition({
      parent: goToObject,
      child: patrol,
      name: 'goToObject -> patrol',
      shouldTransition: () => !goToObject.targets.itemDrop.isValid
    }),

    new StateTransition({
      parent: patrol,
      child: checkItemsToDeposit,
      name: 'patrol -> checkItemsToDeposit',
      shouldTransition: () => patrol.isFinished()
    }),

    new StateTransition({
      parent: patrol,
      child: helpFriend,
      name: 'patrol -> patrol',
      shouldTransition: () => helpFriend.findHelpFriend()
    }),

    new StateTransition({
      parent: helpFriend,
      child: goFriend,
      name: 'helpFriend -> goFriend',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goFriend,
      child: guardCombatJobFunction,
      name: 'goFriend -> guardCombatJobFunction',
      shouldTransition: () => {
        getClosestMob.onStateEntered()
        return targets.entity !== undefined && !helpFriend.targetIsFriend()
      }
    }),

    new StateTransition({
      parent: goFriend,
      child: patrol,
      name: 'Now no need help',
      shouldTransition: () => {
        return !helpFriend.stillNeedHelp()
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
      child: getReady,
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
      child: getReady,
      name: 'depositItems -> getReady',
      shouldTransition: () => depositItems.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      name: 'getReady -> eatFood',
      shouldTransition: () => getReady.getIsReady()
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
    }),

    new StateTransition({
      parent: equip2,
      child: patrol,
      name: 'Continue patrol bot is full',
      shouldTransition: () => equip2.isFinished()
    })

  ]

  const guardJobFunction = new NestedStateMachine(transitions, enter)
  guardJobFunction.stateName = 'Guard Job'
  return guardJobFunction
}

module.exports = guardJobFunction
