const mineflayer = require('mineflayer')
const vec3 = require('vec3')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node digger.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'eventListener',
  password: process.argv[5]
})

bot.on('spawn', () => {
  bot.chat('Hello world!')
})
