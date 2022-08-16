import mineflayerPathfinder, { Movements } from 'mineflayer-pathfinder'
import botWebsocket from '@/modules/botWebsocket'
import { Bot, LegionStateMachineTargets } from '@/types'
import mcDataLoader from 'minecraft-data'
import { Vec3 } from 'vec3'

module.exports = class BehaviorMoveToArray {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly mcData: mcDataLoader.IndexedData
  stateName: string
  x?: number
  y?: number

  active: boolean
  distance: number
  movements: Movements
  patrol: Array<Vec3>
  startNearestPoint: boolean
  currentPosition: number
  endPatrol: boolean
  position?: Vec3


  constructor(bot: Bot, targets: LegionStateMachineTargets, patrol = [], startNearestPoint = false, distance = 2) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMoveToArray'

    this.patrol = patrol
    this.startNearestPoint = startNearestPoint
    this.distance = distance

    this.currentPosition = 0
    this.endPatrol = false
    this.active = false

    this.mcData = mcDataLoader(bot.version)
    this.movements = new mineflayerPathfinder.Movements(this.bot, this.mcData)

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
    let nearestDistance = Infinity
    let nearestPoint = 0
    let currentPoint = 0
    if (this.patrol.length === 0) {
      return
    }
    this.patrol.forEach(position => {
      const distance = this.getDistance(position)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestPoint = currentPoint
      }
      currentPoint++
    })
    this.currentPosition = nearestPoint
  }

  isFinished() {
    if (this.distanceToTarget() <= this.distance && this.endPatrol === false) {
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
      botWebsocket.log('[MoveTo] Target not defined. Skipping.')
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

  getDistance(position?: Vec3) {
    if (!position) { return 0 }
    return this.bot.entity.position.distanceTo(position)
  }

  setPatrol(patrol: Array<Vec3>, startNearestPoint = false) {
    this.patrol = patrol
    if (startNearestPoint === true && this.patrol !== undefined) {
      this.sortPatrol()
    }
  }
}
