const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorFollowEntity
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMoveToArray = require('./../BehaviorModules/BehaviorMoveToArray')
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')
const BehaviorFindItems = require('./../BehaviorModules/BehaviorFindItems')
const BehaviorHelpFriend = require('./../BehaviorModules/BehaviorHelpFriend')

const validFood = ['cooked_chicken']

function guardJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const patrol = new BehaviorMoveToArray(bot, targets)
  patrol.stateName = 'Patrol'
  patrol.x = 525
  patrol.y = 513

  const getClosestMob = require('./../modules/getClosestEnemy')(bot, targets)

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Patrol'
  getReady.x = 525
  getReady.y = 113

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip items'
  equip.x = 725
  equip.y = 313

  const eatFood = new BehaviorEatFood(bot, targets, validFood)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 225
  eatFood.y = 513

  const eatFoodCombat = new BehaviorEatFood(bot, targets, validFood)
  eatFoodCombat.stateName = 'Eat Food In Combat'
  eatFoodCombat.x = 1125
  eatFoodCombat.y = 513

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Pick up item'
  goToObject.x = 725
  goToObject.y = 625

  const findItem = new BehaviorFindItems(bot, targets)
  findItem.stateName = 'Find Item Dropped'

  const helpFriend = new BehaviorHelpFriend(bot, targets)
  helpFriend.stateName = 'Check friend needs help'
  helpFriend.x = 525
  helpFriend.y = 813

  const goFriend = new BehaviorFollowEntity(bot, targets)
  goFriend.stateName = 'Go To Help Friend'
  goFriend.x = 725
  goFriend.y = 813

  const combatFunction = require('./combatFunction')(bot, targets)
  combatFunction.x = 925
  combatFunction.y = 513

  const goChests = require('./goChestsFunctions')(bot, targets)
  goChests.x = 325
  goChests.y = 313

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
        patrol.setPatrol(loadConfig.getPatrol(), true)
        getClosestMob.setMode(loadConfig.getMode())
        getClosestMob.setDistance(loadConfig.getDistance())
        helpFriend.setHelpFriends(loadConfig.getHelpFriend())
        getReady.setItemsToBeReady(loadConfig.getItemsToBeReady())
        findItem.setPickUpItems(loadConfig.getPickUpItems())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: patrol,
      child: combatFunction,
      name: 'patrol -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: goToObject,
      child: combatFunction,
      name: 'goToObject -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: patrol,
      child: goToObject,
      name: 'patrol -> goToObject',
      onTransition: () => {
        targets.position = targets.itemDrop.position.clone()
      },
      shouldTransition: () => findItem.search() && findItem.checkInventorySpace() > 3
    }),

    new StateTransition({
      parent: goToObject,
      child: patrol,
      name: 'goToObject -> patrol',
      shouldTransition: () => {
        if (!goToObject.targets.itemDrop.isValid) {
          return true
        }

        if (targets.position.distanceTo(targets.itemDrop.position) > 1) {
          targets.position = targets.itemDrop.position.clone()
          goToObject.restart()
        }

        return false
      }
    }),

    new StateTransition({
      parent: patrol,
      child: getReady,
      name: 'patrol -> getReady',
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
      child: combatFunction,
      name: 'goFriend -> combatFunction',
      shouldTransition: () => {
        getClosestMob.check()
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
      parent: getReady,
      child: equip,
      name: 'Bot is ready for start patrol',
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 34
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      name: 'Need get items from chest or inventory is full',
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 34
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'goChests -> getReady',
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: equip,
      child: patrol,
      name: 'Equip is finished',
      shouldTransition: () => equip.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: equip,
      name: 'Mob is dead',
      shouldTransition: () => combatFunction.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFoodCombat,
      name: 'Eat In Combat',
      shouldTransition: () => bot.health < 15 && bot.food !== 20 && eatFoodCombat.checkFoodInInventory().length > 0
    }),

    new StateTransition({
      parent: eatFoodCombat,
      child: combatFunction,
      name: 'End Eat In Combat',
      shouldTransition: () => eatFoodCombat.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: patrol,
      name: 'Continue patrol bot is full',
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: patrol,
      child: eatFood,
      name: 'Boot need eat',
      shouldTransition: () => bot.food !== 20 && eatFood.checkFoodInInventory().length > 0
    })

  ]

  const guardJobFunction = new NestedStateMachine(transitions, start)
  guardJobFunction.stateName = 'Guard Job'
  return guardJobFunction
}

module.exports = guardJobFunction
