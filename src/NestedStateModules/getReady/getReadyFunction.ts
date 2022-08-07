//@ts-nocheck
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import BehaviorGetReady from '@/BehaviorModules/BehaviorGetReady'
import BehaviorEquipAll from '@/BehaviorModules/BehaviorEquipAll'
import { Bot, LegionStateMachineTargets } from '@/types'

function getReadyFunction(bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const goChests = require('@NestedStateModules/getReady/goChestsFunctions')(bot, targets)
  goChests.x = 725
  goChests.y = 313

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Check if bot is ready'
  getReady.x = 525
  getReady.y = 113

  const equipAll = new BehaviorEquipAll(bot, targets)
  equipAll.x = 325
  equipAll.y = 313

  const transitions = [

    new StateTransition({
      parent: start,
      child: getReady,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 33
    }),

    new StateTransition({
      parent: getReady,
      child: equipAll,
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 33
    }),

    new StateTransition({
      parent: equipAll,
      child: exit,
      shouldTransition: () => equipAll.isFinished()
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'Go to chests',
      shouldTransition: () => goChests.isFinished()
    })
  ]

  const getReadyFunction = new NestedStateMachine(transitions, start, exit)
  getReadyFunction.stateName = 'getReadyFunction'
  return getReadyFunction
}

module.exports = getReadyFunction
