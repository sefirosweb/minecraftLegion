const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
    console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
    process.exit(1)
}

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'chest',
    password: process.argv[5]
})

let mcData

bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})

bot.once('spawn', () => {
    console.log(bot.username)
    bot.chat('Hello world my name is:')
})
