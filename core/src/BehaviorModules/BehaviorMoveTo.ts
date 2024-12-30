import { Bot, Dimension, Dimension_V2 } from 'mineflayer'
import mineflayerPathfinder, { Movements } from 'mineflayer-pathfinder'
import { LegionStateMachineTargets, Vec3WithDimension } from 'base-types'
import { movementModule, botWebsocket } from '@/modules'
import { StateBehavior } from 'minecraftlegion-statemachine'

export class BehaviorMoveTo implements StateBehavior {
  active: boolean
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  currentDate?: number
  success: boolean
  isEndFinished: boolean
  distance: number
  movements: Movements
  movementModule: ReturnType<typeof movementModule>
  timeout?: number
  timeLimit?: ReturnType<typeof setTimeout>

  constructor(bot: Bot, targets: LegionStateMachineTargets, timeout?: number) {
    this.stateName = 'moveTo'
    this.active = false
    this.timeout = timeout
    this.isEndFinished = false
    this.success = false

    this.distance = 0
    this.bot = bot
    this.targets = targets
    this.movements = new mineflayerPathfinder.Movements(bot)

    this.movementModule = movementModule(bot, targets)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.success = false
    // this.bot.on('path_update', (r) => {
    //   if (r.status === 'noPath') {
    //     console.log('[MoveTo] No path to target!')
    //   }
    // })

    this.currentDate = Date.now()

    this.bot.on('customEventPhysicTick', () => {
      const checkDate = Date.now()
      if (this.currentDate && checkDate - this.currentDate > 15000) {
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
    this.bot.removeAllListeners('path_update')
    this.bot.removeAllListeners('goal_reached')
    this.isEndFinished = false
    this.success = false
    this.stopMoving()
    clearTimeout(this.timeLimit)
  }

  goalReached() {
    botWebsocket.log('[MoveTo] Target reached.')
    this.success = true
    this.isEndFinished = true
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

    const dimension = position.dimension ?? this.bot.game.dimension as Dimension_V2

    if (dimension === this.bot.game.dimension as Dimension_V2) {
      this.bot.pathfinder.setMovements(this.movements)
      this.bot.pathfinder.setGoal(goal)
    } else {
      this.crossThePortal(dimension, position)
    }
  }

  crossThePortal(dimension: Dimension_V2, destination: Vec3WithDimension) {
    this.movementModule.crossThePortal(dimension as Dimension_V2, destination)
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
