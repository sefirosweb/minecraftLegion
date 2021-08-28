const botWebsocket = require('@modules/botWebsocket')
const {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

function feedAnimalFunction (bot, targets) {
  targets.breededAnimals = []

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 613

  const followAnimal = new BehaviorFollowEntity(bot, targets)
  followAnimal.stateName = 'Follow Animal'
  followAnimal.x = 100
  followAnimal.y = 100

  const transitions = [
    new StateTransition({
      parent: start,
      child: followAnimal,
      onTransition: () => {
        console.log(targets.entity)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: followAnimal,
      child: exit,
      shouldTransition: () => !targets.entity || (followAnimal.distanceToTarget() < 2 && targets.entity.isValid)
    })

  ]

  const feedAnimalFunction = new NestedStateMachine(transitions, start, exit)
  feedAnimalFunction.stateName = 'feedAnimalFunction'
  return feedAnimalFunction
}

module.exports = feedAnimalFunction
