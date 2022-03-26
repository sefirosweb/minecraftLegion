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
      this.corssThePortal(dimension)
    }
  }

  corssThePortal(dimension) {
    let matching
    if ( //Nether portal
      dimension === 'minecraft:the_nether' && this.bot.game.dimension === 'minecraft:overworld'
      || dimension === 'minecraft:overworld' && this.bot.game.dimension === 'minecraft:the_nether'
      || dimension === 'minecraft:the_end' && this.bot.game.dimension === 'minecraft:the_nether'
    ) {
      matching = ['nether_portal'].map(name => this.mcData.blocksByName[name].id)
    }

    if ( // End Portal
      dimension === 'minecraft:the_end' && this.bot.game.dimension === 'minecraft:overworld'
      || dimension === 'minecraft:overworld' && this.bot.game.dimension === 'minecraft:the_end'
      || dimension === 'minecraft:the_nether' && this.bot.game.dimension === 'minecraft:the_end'
    ) {
      matching = ['end_portal'].map(name => this.mcData.blocksByName[name].id)
    }

    const blocksFound = this.bot.findBlocks({
      matching,
      maxDistance: 128,
      count: 16
    })

    if (blocksFound.length === 0) {
      this.stopMoving()
      botWebsocket.log(`[MoveTo] Can't find the portal to dimension ${dimension}`)
      this.isEndFinished = true
      return
    }

    blocksFound.sort(
      (a, b) => {
        return a.y - b.y
      }
    )

    const portal = blocksFound[0]

    this.goPosition(portal)
      .then(() => {
        return new Promise((resolve) => {
          this.bot.once('spawn', () => {
            setTimeout(() => {
              resolve();
            })
          })
        });
      })
      .then(() => {
        this.startMoving()
      })
  }

  goPosition(position) {
    const goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
    this.bot.pathfinder.setMovements(this.movements);
    this.bot.pathfinder.setGoal(goal);

    return new Promise((resolve) => {
      this.bot.once("goal_reached", () => {
        resolve();
      });
    });
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
