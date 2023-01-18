import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'

import BehaviorSleep from '@/BehaviorModules/BehaviorSleep'
import { Bot, LegionStateMachineTargets } from '@/types'

const goSleepFunction = function (bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 125
  //@ts-ignore
  exit.y = 313

  const goSleepArea = new BehaviorMoveTo(bot, targets);
  goSleepArea.stateName = "Go to sleep area";
  goSleepArea.movements = targets.movements;
  goSleepArea.x = 325
  goSleepArea.y = 113

  const searchBeds = new BehaviorIdle()
  searchBeds.stateName = 'Search nearby beds'
  //@ts-ignore
  searchBeds.x = 325
  //@ts-ignore
  searchBeds.y = 213

  const waitUntilWakeUp = new BehaviorIdle()
  waitUntilWakeUp.stateName = 'Wait until wake up'
  //@ts-ignore
  waitUntilWakeUp.x = 325
  //@ts-ignore
  waitUntilWakeUp.y = 413

  const goToBed = new BehaviorMoveTo(bot, targets);
  goToBed.stateName = "Go to bed";
  goToBed.movements = targets.movements;
  goToBed.x = 525
  goToBed.y = 213

  const interactWithBed = new BehaviorSleep(bot, targets)
  interactWithBed.stateName = 'Interact With Bed'
  interactWithBed.x = 525
  interactWithBed.y = 313

  let nearBeds: Array<any> = []

  const transitions = [

    new StateTransition({
      parent: start,
      child: goSleepArea,
      onTransition: () => {
        targets.position = targets.config.sleepArea
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: goSleepArea,
      child: searchBeds,
      onTransition: () => {

        nearBeds = bot.findBlocks({
          //@ts-ignore
          matching: block => bot.isABed(block),
          maxDistance: 16,
          count: 99
        })
          .map(p => {
            return {
              position: p,
              distance: p.distanceTo(bot.entity.position)
            }
          })
          .sort((a, b) => {
            return a.distance - b.distance
          })
      },
      shouldTransition: () => targets.config.sleepArea !== undefined && bot.entity.position.distanceTo(targets.config.sleepArea) < 5
    }),

    new StateTransition({
      parent: searchBeds,
      child: goToBed,
      onTransition: () => {
        targets.position = nearBeds.shift().position
      },
      shouldTransition: () => nearBeds.length > 0
    }),

    new StateTransition({
      parent: searchBeds,
      child: exit,
      shouldTransition: () => nearBeds.length === 0
    }),

    new StateTransition({
      parent: goToBed,
      child: interactWithBed,
      shouldTransition: () => goToBed.isFinished() || goToBed.distanceToTarget() < 2
    }),

    new StateTransition({
      parent: interactWithBed,
      child: goToBed,
      onTransition: () => {
        targets.position = nearBeds.shift().position
      },
      shouldTransition: () => interactWithBed.isOccuped() && nearBeds.length > 0
    }),

    new StateTransition({
      parent: interactWithBed,
      child: waitUntilWakeUp,
      onTransition: () => {
        bot.once('wake', () => {
          transitions[7].trigger()
        })
      },
      shouldTransition: () => interactWithBed.isFinished()
    }),

    new StateTransition({
      parent: waitUntilWakeUp,
      child: exit,
      shouldTransition: () => targets.isNight === false
    }),

    new StateTransition({
      parent: interactWithBed,
      child: exit,
      shouldTransition: () => interactWithBed.isCantSleepNow() || nearBeds.length === 0
    }),

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Go Sleep'
  return nestedState
}

export default goSleepFunction
