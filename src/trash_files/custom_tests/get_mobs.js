const mineflayer = require('mineflayer')
const inventoryViewer = require('mineflayer-web-inventory')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node get_mobs.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'Checkmobs',
  password: process.argv[5]
})

const entitiesInfoHotFox = require('../../modules/entities')

bot.once('spawn', () => {
  for (const entityName of Object.keys(bot.entities)) {
    const entity = bot.entities[entityName]
    if (entity.name !== 'husk') { continue }

    console.log(entity)
    console.log(entity.kind)
    break
  }
})
