import { StateTransition, BehaviorIdle, NestedStateMachine } from 'minecraftlegion-statemachine'
import { BehaviorMoveTo } from '@/BehaviorModules'
import { LegionStateMachineTargets } from 'base-types'
import { Block } from 'prismarine-block'
import { Bot } from 'mineflayer'

function goCraftingTableFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'
  exit.x = 125
  exit.y = 213

  const checkCraftingTable = new BehaviorIdle()
  checkCraftingTable.stateName = 'Check near crafting table'
  checkCraftingTable.x = 325
  checkCraftingTable.y = 113

  const goTable = new BehaviorMoveTo(bot, targets)
  goTable.stateName = 'Move to crafting table'
  goTable.movements = targets.movements
  goTable.x = 325
  goTable.y = 213

  let craftingTable: Block | null = null

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkCraftingTable,
      onTransition: () => {
        const craftingTableID = bot.mcData.blocksByName.crafting_table.id
        craftingTable = bot.findBlock({
          matching: craftingTableID,
          maxDistance: 15
        })
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: exit,
      shouldTransition: () => !craftingTable
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: goTable,
      onTransition: () => {
        targets.position = craftingTable?.position
      },
      shouldTransition: () => craftingTable !== null
    }),

    new StateTransition({
      parent: goTable,
      child: exit,
      shouldTransition: () =>
        (goTable.isFinished() || goTable.distanceToTarget() < 2) &&
        !goTable.isSuccess() &&
        !bot.pathfinder.isMining()
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Go crafting table'
  return nestedState
}

export default goCraftingTableFunction
