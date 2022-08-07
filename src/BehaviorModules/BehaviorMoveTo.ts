
// @ts-nocheck

import mineflayerPathfinder, { Movements } from 'mineflayer-pathfinder'
import botWebsocket from '@/modules/botWebsocket'
import { Bot, LegionStateMachineTargets } from '@/types'
import mcDataLoader from 'minecraft-data'
import movementModule from '@/modules/movementModule'

module.exports = class BehaviorMoveTo {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly mcData: mcDataLoader.IndexedData
  stateName: string
  timeout: number
  active: boolean
  success: Boolean
  isEndFinished: boolean
  distance: number
  movements: Movements

  constructor(bot: Bot, targets: LegionStateMachineTargets, timeout: number) {
    this.stateName = 'moveTo'
    this.active = false
    this.timeout = timeout
    this.isEndFinished = false
    this.success = false

    this.distance = 0
    this.bot = bot
    this.targets = targets
    this.mcData = mcDataLoader(bot.version)
    this.movements = new mineflayerPathfinder.Movements(bot, this.mcData)

    this.movementModule = movementModule(bot, targets)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.success = false
    this.bot.on('pathUpdate', () => {
      if (r.status === 'noPath') {
        console.log('[MoveTo] No path to target!')
      }
    })

    this.currentDate = Date.now()

    this.bot.on('customEventPhysicTick', () => {
      const checkDate = Date.now()
      if (checkDate - this.currentDate > 15000) {
        this.restart()
        this.currentDate = Date.now()
      }
    })

    // this.bot.on('goalReached', () => this.goalReached())

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
    this.bot.removeAllListeners('customEventPhysicTick')
    this.isEndFinished = false
    this.success = false
    this.bot.removeAllListeners('pathUpdate')
    this.bot.removeAllListeners('goalReached')
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
    this.bot.removeAllListeners('customEventPhysicTick')
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
