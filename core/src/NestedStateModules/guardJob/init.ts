import { StateTransition, BehaviorIdle, NestedStateMachine, BehaviorFollowEntity } from 'mineflayer-statemachine'
import { BehaviorLoadConfig, BehaviorMoveToArray, BehaviorEatFood, BehaviorEquipAll, BehaviorFindItems, BehaviorHelpFriend, BehaviorMoveTo } from '@/BehaviorModules'
import CombatStrategyFunction from '@/NestedStateModules/combat/init'
import GetReadyFunction from '@/NestedStateModules/getReady/init'
import getClosestEnemy from '@/modules/getClosestEnemy'
import { LegionStateMachineTargets } from 'base-types'
import { Bot } from 'mineflayer'

function guardJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
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
  patrol.movements = targets.movements

  const getClosestMob = getClosestEnemy(bot, targets)

  const equip = new BehaviorEquipAll(bot, targets)
  equip.stateName = 'Equip items'
  equip.x = 725
  equip.y = 363

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 225
  eatFood.y = 513

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Pick up item'
  goToObject.x = 725
  goToObject.y = 625
  goToObject.movements = targets.movements

  const findItem = new BehaviorFindItems(bot, targets, 15, true)
  findItem.stateName = 'Find Item Dropped'

  const helpFriend = new BehaviorHelpFriend(bot, targets)
  helpFriend.stateName = 'Check friend needs help'
  helpFriend.x = 525
  helpFriend.y = 813

  const goFriend = new BehaviorFollowEntity(bot, targets)
  goFriend.stateName = 'Go To Help Friend'
  goFriend.x = 725
  goFriend.y = 813

  const combatStrategy = CombatStrategyFunction(bot, targets)
  combatStrategy.x = 925
  combatStrategy.y = 513

  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 525
  getReady.y = 213

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
        patrol.setPatrol(bot.config.patrol, true)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: patrol,
      child: combatStrategy,
      name: 'patrol -> try getClosestMob',
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: goToObject,
      child: combatStrategy,
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
        if (!targets.itemDrop) throw Error('Variable not defined targets.itemDrop')
        targets.position = targets.itemDrop.position.offset(0, 0.2, 0).clone()
      },
      shouldTransition: () => findItem.search() && bot.inventory.items().length < 33
    }),

    new StateTransition({
      parent: goToObject,
      child: patrol,
      name: 'goToObject -> patrol',
      shouldTransition: () => {
        if (!goToObject.targets.itemDrop?.isValid || targets.position === undefined || targets.itemDrop === undefined) {
          return true
        }

        if (targets.position.distanceTo(targets.itemDrop.position) > 1) {
          targets.position = targets.itemDrop.position.offset(0, 0.2, 0).clone()
          goToObject.restart()
        }

        if (bot.inventory.items().length === 36) {
          return true
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
      child: combatStrategy,
      name: 'goFriend -> combatStrategy',
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined && !helpFriend.targetIsFriend() && targets.entity.isEnemy === true
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
      shouldTransition: () => getReady.isFinished()
    }),

    new StateTransition({
      parent: equip,
      child: patrol,
      name: 'Equip is finished',
      shouldTransition: () => equip.isFinished()
    }),

    new StateTransition({
      parent: combatStrategy,
      child: equip,
      name: 'Mob is dead',
      shouldTransition: () => combatStrategy.isFinished()
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

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'Guard Job'
  return nestedState
}

export default guardJobFunction
