const { sleep } = require('../modules/utils')
const mineflayer = require('mineflayer')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'Sephi',
  password: process.argv[5]
})

bot.once('error', (error) => {
  console.log(error)
})

bot.once('kicked', (error) => {
  console.log(error)
})

bot.once('spawn', async () => {
  const mcData = require('minecraft-data')(bot.version)
  const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
  bot.loadPlugin(pathfinder)
  bot.pathfinder.setMovements(new Movements(bot, mcData))

  const goPosition = () => {
    bot.pathfinder.setGoal(new goals.GoalBlock(37, 51, 11))

    return new Promise(resolve => {
      bot.on('goal_reached', (goal) => {
        resolve()
      })
    })
  }

  bot.chat('/login password')
  await sleep(2000)
  await goPosition()
  await sleep(500)
  let filter = e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 3
  let entity = bot.nearestEntity(filter)
  if (entity) {
    bot.useOn(entity)
    await sleep(2000)
    filter = e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 20
    entity = bot.nearestEntity(filter)
    if (entity) {
      const goal = new goals.GoalFollow(entity, 3)
      bot.pathfinder.setGoal(goal, true)
    }
  }
})
