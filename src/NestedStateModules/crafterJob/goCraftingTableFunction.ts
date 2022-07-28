import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
//@ts-ignore
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { Bot, LegionStateMachineTargets } from '@/types'
import { Block } from 'prismarine-block'
import mcDataLoader from 'minecraft-data'

function goCraftingTableFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const mcData = mcDataLoader(bot.version)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'
  //@ts-ignore
  exit.x = 125
  //@ts-ignore
  exit.y = 213

  const checkCraftingTable = new BehaviorIdle()
  checkCraftingTable.stateName = 'Check near crafting table'
  //@ts-ignore
  checkCraftingTable.x = 325
  //@ts-ignore
  checkCraftingTable.y = 113

  const goTable = new BehaviorMoveTo(bot, targets)
  goTable.stateName = 'Go crafting table'
  goTable.movements = targets.movements
  goTable.x = 325
  goTable.y = 213

  let craftingTable: Block | null = null

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkCraftingTable,
      onTransition: () => {
        const craftingTableID = mcData.blocksByName.crafting_table.id
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

  const goCraftingTableFunction = new NestedStateMachine(
    transitions,
    start,
    exit
  )
  goCraftingTableFunction.stateName = 'Go crafting table'
  return goCraftingTableFunction
}

module.exports = goCraftingTableFunction
