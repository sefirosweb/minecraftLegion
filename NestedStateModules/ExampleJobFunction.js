const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorFollowEntity
} = require('mineflayer-statemachine')
const mineflayerpathfinder = require('mineflayer-pathfinder')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function minerJobFunction (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const transitions = [
    new StateTransition({
      parent: enter,
      child: loadConfig,
      name: 'enter -> loadConfig',
      shouldTransition: () => true
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, enter)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
