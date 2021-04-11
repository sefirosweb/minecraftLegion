const config = require('./config')
const mineflayer = require('mineflayer')
const botWebsocket = require('./modules/botWebsocket')

console.log('Usage : node start_bot.js <botName> <botPassword>')
let botName = process.argv[2]
let botPassword = process.argv[3]

botName = process.argv[4] ? process.argv[4] : process.argv[2] // npm run one botname password
botPassword = process.argv[5] ? process.argv[5] : process.argv[3] // npm run one botname password

createNewBot(botName, botPassword)

function createNewBot (botName, botPassword = '') {
  const bot = mineflayer.createBot({
    username: botName,
    host: config.server,
    port: config.port
  })

  botWebsocket.loadBot(bot)
  bot.setMaxListeners(0)
  bot.once('inject_allowed', () => {
    bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)
  })

  bot.once('kicked', (reason) => {
    const reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
    process.exit()
  })

  bot.once('error', (error) => {
    botWebsocket.log('Error bot detected ' + JSON.stringify(error))
    console.log(error)
    process.exit()
  })

  bot.once('spawn', async () => {
    console.log(bot.version)
    botWebsocket.connect()
    botWebsocket.log('Ready!')

    // const customStart = require('./custom_start/custom')(bot)
    // await customStart.start()
    require('./NestedStateModules/startStateMachine')(bot)
  })
}
