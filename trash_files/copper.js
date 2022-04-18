const mineflayer = require('mineflayer')
const vec3 = require('vec3')

if (process.argv.length < 2 || process.argv.length > 6) {
  console.log('Usage : node copper.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2] ? process.argv[2] : "host.docker.internal",
  port: process.argv[3] ? parseInt(process.argv[3]) : 53989,
  username: process.argv[4] ? process.argv[4] : "copper",
  password: process.argv[5],
});

const blocksToDig = []
blocksToDig.push(new vec3(-4, 66, -14))
blocksToDig.push(new vec3(-5, 66, -14))
blocksToDig.push(new vec3(-6, 66, -14))
blocksToDig.push(new vec3(-7, 66, -14))
blocksToDig.push(new vec3(-8, 66, -13))
blocksToDig.push(new vec3(-8, 66, -12))
blocksToDig.push(new vec3(-8, 66, -11))
blocksToDig.push(new vec3(-8, 66, -10))
blocksToDig.push(new vec3(-7, 66, -9))
blocksToDig.push(new vec3(-6, 66, -9))
blocksToDig.push(new vec3(-5, 66, -9))
blocksToDig.push(new vec3(-4, 66, -9))
blocksToDig.push(new vec3(-3, 66, -10))
blocksToDig.push(new vec3(-3, 66, -11))
blocksToDig.push(new vec3(-3, 66, -12))
blocksToDig.push(new vec3(-3, 66, -13))


bot.once('spawn', () => {
  setTimeout(() => {
    digBlock()
  }, 2000)
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
  mcData.blocksArray[826].hardness = 3
})

function digBlock() {
  if (blocksToDig.length === 0) return

  const target = blocksToDig.shift()
  const blockToDig = bot.blockAt(target)

  if (blockToDig && bot.canDigBlock(blockToDig)) {
    bot.chat(`Starting to dig ${blockToDig.name}`)
    bot.dig(blockToDig)
      .then(() => {
        bot.chat(`Finished ${blockToDig.name}`)
        digBlock()
      })
      .catch((e) => {
        console.log(e)
      })
  }
}