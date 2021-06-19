const mineflayerPathfinder = require('mineflayer-pathfinder')
const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorMoveTo {
  constructor (bot, targets, timeout) {
    this.stateName = 'moveTo'
    this.active = false
    this.timeout = timeout
    this.isEndFinished = false

    this.distance = 0
    this.bot = bot
    this.targets = targets
    const mcData = require('minecraft-data')(this.bot.version)
    this.movements = new mineflayerPathfinder.Movements(bot, mcData)
  }

  onStateEntered () {
    this.isEndFinished = false
    this.bot.on('pathUpdate', this.pathUpdate)
    this.bot.on('goalReached', this.goalReached)

    if (this.timeout) {
      this.timeLimit = setTimeout(() => {
        this.stopMoving()
        console.log('Excede time limit of move')
        this.isEndFinished = true
      }, this.timeout)
    }

    this.startMoving()
  }

  onStateExited () {
    this.isEndFinished = false
    this.bot.removeListener('pathUpdate', this.pathUpdate)
    this.bot.removeListener('goalReached', this.goalReached)
    this.stopMoving()
    clearTimeout(this.timeLimit)
  }

  pathUpdate (r) {
    if (r.status === 'noPath') {
      botWebsocket.log('[MoveTo] No path to target!')
    }
  }

  goalReached () {
    botWebsocket.log('[MoveTo] Target reached.')
  }

  setMoveTarget (position) {
    if (this.targets.position === position) {
      return
    }
    this.targets.position = position
    this.restart()
  }

  stopMoving () {
    const pathfinder = this.bot.pathfinder
    pathfinder.setGoal(null)
  }

  startMoving () {
    const position = this.targets.position
    if (position == null) {
      botWebsocket.log('[MoveTo] Target not defined. Skipping.')
      return
    }
    // botWebsocket.log(`[MoveTo] Moving from ${this.bot.entity.position.toString()} to ${position.toString()}`)

    const pathfinder = this.bot.pathfinder
    let goal
    if (this.distance === 0) {
      goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
    } else {
      goal = new mineflayerPathfinder.goals.GoalNear(position.x, position.y, position.z, this.distance)
    }
    pathfinder.setMovements(this.movements)
    pathfinder.setGoal(goal)
  }

  restart () {
    if (!this.active) {
      return
    }
    this.stopMoving()
    this.startMoving()
  }

  isFinished () {
    const pathfinder = this.bot.pathfinder
    return !pathfinder.isMoving() || this.isEndFinished
  }

  distanceToTarget () {
    const position = this.targets.position
    if (position == null) { return 0 }
    return this.isEndFinished ? 0 : this.bot.entity.position.distanceTo(position)
  }
}
