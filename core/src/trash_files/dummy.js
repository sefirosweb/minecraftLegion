const mineflayer = require('mineflayer')
if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node craft.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'dumny',
  password: process.argv[5]
})

bot.once('login', function () {
  bot.chat('hello world')
})
