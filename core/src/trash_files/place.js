const mineflayer = require('mineflayer')
const vec3 = require('vec3')

if (process.argv.length < 2 || process.argv.length > 6) {
  console.log('Usage : node digger.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const connection = {
  host: process.argv[2] ?? 'host.docker.internal',
  port: process.argv[3] ?? 25565,
  username: process.argv[4] ?? 'digger',
  password: process.argv[5] ?? ''
}

const bot = mineflayer.createBot(connection)

bot.once('spawn', () => {
  bot.chat('/login XXX')
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'loaded':
      await bot.waitForChunksToLoad()
      bot.chat('Ready!')
      break
    case 'list':
      sayItems()
      break
    case 'dig':
      dig()
      break
    case 'place':
      stone = 0
      place()
      break
    case 'build':
      stone = 0
      build()
      break
    case 'equip dirt':
      equipDirt()
      break
  }
})

function sayItems(items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    bot.chat(output)
  } else {
    bot.chat('empty')
  }
}


function place() {
  const block = bot.blockAt(new vec3.Vec3(30, 16, 25))
  const offset = new vec3.Vec3(-1, 0, 0)

  bot.placeBlock(block, offset)
    .then((err) => {
      console.log(err)
    })
    .catch(err => {
      console.log(err)
    })
}

function dig() {
  let target
  if (bot.targetDigBlock) {
    bot.chat(`already digging ${bot.targetDigBlock.name}`)
  } else {
    target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    if (target && bot.canDigBlock(target)) {
      bot.chat(`starting to dig ${target.name}`)
      bot.dig(target, onDiggingCompleted)
    } else {
      bot.chat('cannot dig')
    }
  }

  function onDiggingCompleted(err) {
    if (err) {
      console.log(err.stack)
      return
    }
    dig()
  }
}

let stone = 0

function build() {
  stone++
  console.log(stone)
  if (stone > 3) {
    return
  }
  const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  const jumpY = Math.floor(bot.entity.position.y) + 1.0
  bot.setControlState('jump', true)
  bot.on('move', placeIfHighEnough)

  let tryCount = 0

  function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      bot.placeBlock(referenceBlock, vec3(0, 1, 0), (err) => {
        if (err) {
          tryCount++
          if (tryCount > 10) {
            bot.chat(err.message)
            bot.setControlState('jump', false)
            bot.removeListener('move', placeIfHighEnough)
            return
          }
          return
        }
        bot.setControlState('jump', false)
        bot.removeListener('move', placeIfHighEnough)
        bot.chat('Placing a block was successful')
        build()
      })
    }
  }
}

function equipDirt() {
  const mcData = require('minecraft-data')(bot.version)
  let itemsByName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    itemsByName = 'itemsByName'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    itemsByName = 'blocksByName'
  }
  bot.equip(mcData[itemsByName].dirt.id, 'hand', (err) => {
    if (err) {
      bot.chat(`unable to equip dirt: ${err.message}`)
    } else {
      bot.chat('equipped dirt')
    }
  })
}

function itemToString(item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}
