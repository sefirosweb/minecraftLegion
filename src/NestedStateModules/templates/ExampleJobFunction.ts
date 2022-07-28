import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
import { Bot, LegionStateMachineTargets } from '@/types'

function minerJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      shouldTransition: () => true
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, start)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
