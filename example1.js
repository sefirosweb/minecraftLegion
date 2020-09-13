require('dotenv').config()

const USERNAME = process.env.USER
const AUTOLOGIN = process.env.AUTOLOGIN
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " Conecting to:" + SERVER)

const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
    username: USERNAME,
    host: SERVER,
    port: PORT
})

bot.once('spawn', function(){
    bot.chat('/login ' + AUTOLOGIN)
})

/*
bot.once('spawn', function(){
    bot.chat('/register ' + AUTOLOGIN + ' ' + AUTOLOGIN)
    bot.chat('Hi!')
})
*/

bot.on('chat', function (username, message) {
    if (username === bot.username) return
    console.log(username + ': ' + message)
    if(message == "Hey"){
        bot.chat('Hi!')
    }
})

bot.on('physicTick', function(){
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter)
    if(!playerEntity) return
    const pos = playerEntity.position.offset(0,playerEntity.height,0)
    bot.lookAt(pos)
    // console.log(playerEntity.username) user
});


bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))

// const inventoryViewer = require('mineflayer-web-inventory')
// inventoryViewer(bot)