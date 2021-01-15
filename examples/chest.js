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

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (true) {
    case /^list$/.test(message):
      sayItems()
      break
    case /^chest$/.test(message):
      watchChest()
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

function watchChest() {
  let chestToOpen = bot.findBlock({
    matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
    maxDistance: 6
  })
  if (!chestToOpen) {
    bot.chat('no chest found')
    return
  }
  const chest = bot.openChest(chestToOpen)
  console.log(chest)
  chest.on('open', () => {
    sayItems(chest.items())
  })
  chest.on('updateSlot', (oldItem, newItem) => {
    bot.chat(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)}`)
  })
  chest.on('close', () => {
    bot.chat('chest closed')
  })
}

function itemToString(item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}
