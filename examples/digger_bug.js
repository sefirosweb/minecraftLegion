const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const Vec3 = require('vec3')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node digger.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'digger',
  password: process.argv[5]
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3000 })

  const path = [bot.entity.position.clone()]
  bot.on('move', () => {
    if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
      path.push(bot.entity.position.clone())
      bot.viewer.drawLine('path', path)
    }
  })

  setTimeout(startDig, 1000)
})

const positions = [
  {
    x: 1,
    y: 71,
    z: -17
  },
  {
    x: 0,
    y: 71,
    z: -16
  },
  {
    x: 1,
    y: 71,
    z: -15
  },
  {
    x: 2,
    y: 71,
    z: -16
  }
]
let i = 0
function startDig () {
  const target = bot.blockAt(new Vec3(positions[i].x, positions[i].y, positions[i].z))
  i++
  if (i >= positions.length) {
    i = 0
  }
  console.log(target.position)

  bot.chat(`starting to dig ${target.name}`)
  bot.dig(target)
    .then(() => {
      console.log(target.name, ' digged')
    })
    .catch(err => {
      console.log(err.stack)
    })
    .finally(() => {
      setTimeout(startDig, 1000)
    })
}
