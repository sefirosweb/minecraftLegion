const { Vec3 } = require('vec3')
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node cross <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'cross',
  password: process.argv[5]
})

bot.once('inject_allowed', () => {
  bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)
})

bot.once('spawn', () => {
  bot.chat('Hi')
  const mcData = require('minecraft-data')(bot.version)

  const goPortal = (position) => {
    bot.loadPlugin(pathfinder)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
    bot.pathfinder.setGoal(new goals.GoalBlock(position.x, position.y, position.z))

    return new Promise((resolve) => {
      bot.on('goal_reached', (goal) => {
        resolve()
      })
    })
  }

  const matching = ['nether_portal', 'end_portal'].map(name => mcData.blocksByName[name].id)
  const point = bot.entity.position.floored()

  const blocksFound = bot.findBlocks({
    matching,
    maxDistance: 128,
    count: 16
  })

  if (blocksFound.length > 0) {
    blocksFound.sort(
      (a, b) => {
        return a.y - b.y
      }
    )

    const netherPortal = blocksFound[0]
    console.log(netherPortal)
    goPortal(netherPortal)
      .then(() => {
        bot.once('spawn', (asd) => {
          console.log('spawned')
        })
      })
  } else {
    console.log(false)
  }
})
