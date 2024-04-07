import { PartiallyComputedPath } from "mineflayer-pathfinder"

const { Vec3 } = require('vec3')
const mineflayer = require('mineflayer')
const { Movements, goals, pathfinder } = require('mineflayer-pathfinder')

// usage:
// node -r ts-node/register src/trash_files/pathfinder.ts localhost 25565 Miner

const bot = mineflayer.createBot({
  host: process.argv[2] ? process.argv[2] : 'localhost',
  port: parseInt(process.argv[3]) ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'pathfinder',
  password: process.argv[5]
})

bot.loadPlugin(pathfinder)

const path_update = (r: PartiallyComputedPath) => {
  if (r.status === 'noPath') { console.log('[MoveTo] No path to target!') }
}

const goal_reached = () => {
  if (true) { console.log('[MoveTo] Target reached.') }
}

const startMoving = () => {
  const distance = 3
  // const position = new Vec3(0, 131, -6)
  const position = new Vec3(0, -60, -6)
  console.log(`[MoveTo] Moving from ${bot.entity.position.toString()} to ${position.toString()}`)

  const goal = new goals.GoalNear(position.x, position.y, position.z, distance)
  const movements = new Movements(bot)
  movements.allowSprinting = false
  movements.canDig = false
  movements.allow1by1towers = false
  movements.scafoldingBlocks = []

  bot.pathfinder.setMovements(movements)
  bot.pathfinder.setGoal(goal)
}

const start = () => {
  bot.pathfinder.setGoal(null)
  bot.on('path_update', path_update)
  bot.on('goal_reached', goal_reached)
  startMoving()
}

bot.on('death', () => {
  bot.removeListener('path_update', path_update)
  bot.removeListener('goal_reached', goal_reached)
})


bot.on('spawn', start)
