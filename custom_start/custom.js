const { sleep } = require('@modules/utils')

module.exports = (bot) => {
  const start = async () => {
    // Login
    bot.chat('/login XXX')
    await sleep(500)

    await goPosition()

    await sleep(500)

    // Click To
    const filter = e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 3
    const entity = bot.nearestEntity(filter)
    if (entity) { bot.useOn(entity) }
    await sleep(500)
  }

  const goPosition = () => {
    const mcData = require('minecraft-data')(bot.version)
    const mineflayerPathfinder = require('mineflayer-pathfinder')
    const movements = new mineflayerPathfinder.Movements(bot, mcData)
    const pathfinder = bot.pathfinder
    const goal = new mineflayerPathfinder.goals.GoalBlock(275, 76, -194, 2)
    pathfinder.setMovements(movements)
    pathfinder.setGoal(goal)

    return new Promise(resolve => {
      bot.on('goal_reached', (goal) => {
        resolve()
      })
    })
  }

  return {
    start
  }
}
