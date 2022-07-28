import { Bot, LegionStateMachineTargets } from "@/types"

import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorFindItems from '@/BehaviorModules/BehaviorFindItems'
//@ts-ignore
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
//@ts-ignore
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { Vec3 } from "vec3"

function findItemsAndPickup(bot: Bot, targets: LegionStateMachineTargets) {
  let botPosition: Vec3
  let botPositionTime = 0

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 325
  //@ts-ignore
  exit.y = 513

  const findItem = new BehaviorFindItems(bot, targets, 15, true)
  findItem.stateName = 'Find Items'
  findItem.x = 325
  findItem.y = 313

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Go to Object'
  goToObject.x = 525
  goToObject.y = 313
  goToObject.movements = targets.movements

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: findItem,
      name: 'loadConfig -> patrol',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: findItem,
      child: goToObject,
      onTransition: () => {
        targets.position = targets.itemDrop?.position.offset(0, 0.2, 0).clone()
        botPosition = bot.entity.position.clone()
        botPositionTime = Date.now()
      },
      shouldTransition: () => findItem.isFinished() && targets.itemDrop !== undefined && bot.inventory.items().length < 33
    }),

    new StateTransition({
      parent: findItem,
      child: exit,
      shouldTransition: () => (findItem.isFinished() && targets.itemDrop === undefined) || bot.inventory.items().length >= 33
    }),

    new StateTransition({
      parent: goToObject,
      child: exit,
      shouldTransition: () => {
        // For avoid bot stucks check if is in same position 10 secs and exit
        if (bot.entity.position.distanceTo(botPosition) > 1) {
          botPosition = bot.entity.position.clone()
          botPositionTime = Date.now()
        }
        if (Date.now() - botPositionTime > 10000) {
          return true
        }

        return bot.inventory.items().length >= 33
      }
    }),

    new StateTransition({
      parent: goToObject,
      child: findItem,
      shouldTransition: () => {
        if (!goToObject.targets.itemDrop.isValid) {
          return true
        }

        if (targets.position && targets.itemDrop && targets.position.distanceTo(targets.itemDrop.position) > 0.3) {
          targets.position = targets.itemDrop.position.offset(0, 0.2, 0).clone()
          goToObject.restart()
        }

        if (bot.inventory.items().length === 36) { // full
          return true
        }

        return false
      }
    })

  ]

  const findItemsAndPickup = new NestedStateMachine(transitions, start, exit)
  findItemsAndPickup.stateName = 'Find Items and pickup'
  return findItemsAndPickup
}

module.exports = findItemsAndPickup
