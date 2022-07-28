import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import { Vec3 } from 'vec3'
import inventoryModule from '@/modules/inventoryModule'

function crafterJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { getResumeInventory } = inventoryModule(bot)

  const start = new BehaviorIdle()
  start.stateName = 'Start'

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'

  const searchAndCraft =
    require('@NestedStateModules/crafterJob/searchAndCraftFunction')(
      bot,
      targets
    )

  const goAndDeposit = require('@NestedStateModules/getReady/goAndDeposit')(
    bot,
    targets
  )
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

  const crafterJobFunction = new NestedStateMachine(transitions, start)
  crafterJobFunction.stateName = 'Crafter Job'
  return crafterJobFunction
}

module.exports = crafterJobFunction
