const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

function pickUpItems (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 225
  exit.y = 413

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.x = 525
  moveToBlock.y = 113
  moveToBlock.movements = targets.movements

  const checkNextChest = new BehaviorIdle(targets)
  checkNextChest.stateName = 'Check Next Chest'

  const transitions = [

    new StateTransition({
      parent: start,
      child: checkNextChest,
      onTransition: () => {
        console.log(targets)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkNextChest,
      child: exit,
      shouldTransition: () => false
    })
  ]

  const pickUpItems = new NestedStateMachine(transitions, start)
  pickUpItems.stateName = 'pickUpItems'
  return pickUpItems
}

module.exports = pickUpItems
