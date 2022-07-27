const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

function goCraftingTableFunction (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'exit'
  exit.x = 125
  exit.y = 213

  const checkCraftingTable = new BehaviorIdle(targets)
  checkCraftingTable.stateName = 'Check near crafting table'
  checkCraftingTable.x = 325
  checkCraftingTable.y = 113

  const goTable = new BehaviorMoveTo(bot, targets)
  goTable.stateName = 'Go crafting table'
  goTable.movements = targets.movements
  goTable.x = 325
  goTable.y = 213

  let craftingTable = false

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
        targets.position = craftingTable.position
      },
      shouldTransition: () => craftingTable
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
