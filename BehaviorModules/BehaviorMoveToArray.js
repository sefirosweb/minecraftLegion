const mineflayerPathfinder = require('mineflayer-pathfinder')

module.exports = class BehaviorMoveToArray {
  constructor(bot, targets, patrol = [], startNearestPoint = false) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMoveToArray'

    this.currentPosition = 0
    this.endPatrol = false
    this.active = false
    this.patrol = patrol
    this.startNearestPoint = startNearestPoint
    this.position = false

    const mcData = require('minecraft-data')(this.bot.version)
    this.movements = new mineflayerPathfinder.Movements(this.bot, mcData)

    this.bot.on('path_update', (r) => {
      if (r.status === 'noPath') {
        // this.endPatrol = true;
      }
    })

    if (this.startNearestPoint === true && this.patrol !== undefined) {
      this.sortPatrol()
    }
  }

  onStateEntered() {
    this.startMoving()
  }

  onStateExited() {
    this.stopMoving()
  }

  sortPatrol() {
    let nearestDistance = false
    let nearestPoint = 0
    let currentPoint = 0
    if (this.patrol.length === 0) {
      return
    }
    this.patrol.forEach(position => {
      const distance = this.getDistance(position)
      if (distance < nearestDistance || !nearestDistance) {
        nearestDistance = distance
        nearestPoint = currentPoint
      }
      currentPoint++
    })
    this.currentPosition = nearestPoint
  }

  getEndPatrol() {
    if (this.distanceToTarget() <= 2 && this.endPatrol === false) {
      this.startMoving()
      return false
    }

    if (this.endPatrol) {
      return true
    }

    return false
  };

  stopMoving() {
    const pathfinder = this.bot.pathfinder
    pathfinder.setGoal(null)
  };

  startMoving() {
    this.position = this.patrol[this.currentPosition]
    this.currentPosition++

    if (this.currentPosition > this.patrol.length) {
      this.currentPosition = 0
      this.endPatrol = true
      this.position = this.patrol[this.currentPosition]
    } else {
      this.endPatrol = false
    }

    const position = this.position
    if (!position) {
      console.log('[MoveTo] Target not defined. Skipping.')
      return
    }

    const pathfinder = this.bot.pathfinder
    const goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
    pathfinder.setMovements(this.movements)
    pathfinder.setGoal(goal)
  }

  restart() {
    this.stopMoving()
    this.startMoving()
  }

  distanceToTarget() {
    const position = this.position
    return this.getDistance(position)
  }

  getDistance(position) {
    if (!position) { return 0 }
    return this.bot.entity.position.distanceTo(position)
  }

  setPatrol(patrol, startNearestPoint = false) {
    this.patrol = patrol
    if (startNearestPoint === true && this.patrol !== undefined) {
      this.sortPatrol()
    }
  }
}
