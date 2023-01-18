import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import { Vec3 } from 'vec3'
import inventoryModule from '@/modules/inventoryModule'
import SearchAndCraftFunction from '@/NestedStateModules/crafterJob/searchAndCraftFunction'
import GoAndDeposit from '@/NestedStateModules/getReady/goAndDeposit'

function crafterJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { getResumeInventory } = inventoryModule(bot)

  const start = new BehaviorIdle()
  start.stateName = 'Start'

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'

  const searchAndCraft = SearchAndCraftFunction(bot, targets)

  const goAndDeposit = GoAndDeposit(bot, targets)
  goAndDeposit.stateName = 'Go chest and Deposit'

  const transitions = [
    new StateTransition({
      parent: start,
      child: searchAndCraft,
      onTransition: () => {
        targets.craftItemBatch = [
          {
            name: 'iron_sword',
            quantity: 3
          },
          {
            name: 'iron_axe',
            quantity: 2
          },
          {
            name: 'iron_pickaxe',
            quantity: 2
          }
        ]
      },
      shouldTransition: () => true
    }),
    new StateTransition({
      parent: searchAndCraft,
      child: goAndDeposit,
      onTransition: () => {
        targets.position = new Vec3(-233, 64, -40)
        const items = getResumeInventory()
        targets.items = items
      },
      shouldTransition: () => searchAndCraft.isFinished()
    }),
    new StateTransition({
      parent: goAndDeposit,
      child: exit,
      shouldTransition: () => false
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'Crafter Job'
  return nestedState
}

export default crafterJobFunction
