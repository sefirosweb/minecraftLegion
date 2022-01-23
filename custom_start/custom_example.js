const { sleep } = require('@modules/utils')

module.exports = (bot) => {
  const start = async () => {
    // Login
    // await sleep(500)
    // bot.chat('/register legion legion') // First time for register to the server
    await sleep(500)
    bot.chat('/login legion')
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
    const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
    bot.loadPlugin(pathfinder)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
    bot.pathfinder.setGoal(new goals.GoalBlock(37, 51, 11))

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