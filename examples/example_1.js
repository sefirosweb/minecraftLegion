require('dotenv').config()
const USERNAME = process.env.USER
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log('Bot: ' + USERNAME + ' Conecting to:' + SERVER)
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  username: USERNAME,
  host: SERVER,
  port: PORT
})

// Console logs for issues
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))

// Example Chat
bot.on('chat', function (username, message) {
  if (username === bot.username) return
  console.log(username + ': ' + message)
  if (message == 'Hey') {
    bot.chat('Hi!')
  }
})

// Example looking to nearest player
bot.on('physicTick', function () {
  const playerFilter = (entity) => entity.type === 'player'
  const playerEntity = bot.nearestEntity(playerFilter)
  if (!playerEntity) return
  const pos = playerEntity.position.offset(0, playerEntity.height, 0)
  bot.lookAt(pos)
})
