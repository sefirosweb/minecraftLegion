const mineflayerPathfinder = require('mineflayer-pathfinder')
const botWebsocket = require('@modules/botWebsocket')


module.exports = class BehaviorMoveTo {
  constructor(bot, targets, timeout) {
    this.stateName = 'moveTo'
    this.active = false
    this.timeout = timeout
    this.isEndFinished = false
    this.success = false

    this.distance = 0
    this.bot = bot
    this.targets = targets
    this.mcData = require('minecraft-data')(this.bot.version)
    this.movements = new mineflayerPathfinder.Movements(bot, this.mcData)

    this.movementModule = require('@modules/movementModule')(bot, targets)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.success = false
    this.bot.on('pathUpdate', this.pathUpdate)
    this.bot.on('goalReached', this.goalReached)

    if (this.timeout) {
      this.timeLimit = setTimeout(() => {
        this.stopMoving()
        botWebsocket.log('Excede time limit of move')
        this.isEndFinished = true
      }, this.timeout)
    }

    this.startMoving()
  }

  onStateExited() {
    this.isEndFinished = false
    this.success = false
    this.bot.removeListener('pathUpdate', this.pathUpdate)
    this.bot.removeListener('goalReached', this.goalReached)
    this.stopMoving()
    clearTimeout(this.timeLimit)
  }

  pathUpdate(r) {
    if (r.status === 'noPath') {
      botWebsocket.log('[MoveTo] No path to target!')
    }
  }

  goalReached() {
    botWebsocket.log('[MoveTo] Target reached.')
    this.success = true
    this.isEndFinished = true
  }

  setMoveTarget(position) {
    if (this.targets.position === position) {
      return
    }
    this.targets.position = position
    this.restart()
  }

  stopMoving() {
    this.bot.pathfinder.setGoal(null)
  }

  startMoving() {
    const position = this.targets.position
    if (position == null) {
      botWebsocket.log('[MoveTo] Target not defined. Skipping.')
      return
    }

    let goal
    if (this.distance === 0) {
      goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
    } else {
      goal = new mineflayerPathfinder.goals.GoalNear(position.x, position.y, position.z, this.distance)
    }

    const dimension = position.dimension ? position.dimension : this.bot.game.dimension

    if (dimension === this.bot.game.dimension) {
      this.bot.pathfinder.setMovements(this.movements)
      this.bot.pathfinder.setGoal(goal)
    } else {
      this.crossThePortal(dimension, position)
    }
  }

  crossThePortal(dimension, destination) {
    this.movementModule.crossThePortal(dimension, destination)
      .then(() => {
        this.startMoving()
      })
      .catch((err) => {
        this.stopMoving()
        botWebsocket.log(err)
        this.isEndFinished = true
      })
  }

  restart() {
    if (!this.active) {
      return
    }
    this.stopMoving()
    this.startMoving()
  }

  isFinished() {
    return this.isEndFinished
  }

  isSuccess() {
    return false
  }

  distanceToTarget() {
    const position = this.targets.position
    if (position == null) { return 0 }
    return this.bot.entity.position.distanceTo(position)
  }
}
