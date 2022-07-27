import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

function template(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 575
  //@ts-ignore
  exit.y = 263

  const transitions = [

    new StateTransition({
      parent: start,
      child: exit,
      name: 'start',
      onTransition: () => {
        console.log('xxx')
      },
      shouldTransition: () => true
    })

  ]

  const template = new NestedStateMachine(transitions, start, exit)
  template.stateName = 'Template'
  return template
}

module.exports = template
