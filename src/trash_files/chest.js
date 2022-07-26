const mineflayer = require('mineflayer')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'chest',
  password: process.argv[5]
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.once('spawn', () => {
  bot.chat('Ready!')
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
    case /^deposit$/.test(message):
      depositChest()
      break
  }
})

let chestOpen
function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    bot.chat(output)
  } else {
    bot.chat('empty')
  }
}

async function openChest () {
  if (chestOpen) {
    console.log('Chest is already open')
    return chestOpen
  }
  const chestToOpen = bot.findBlock({
    matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
    maxDistance: 6
  })
  if (!chestToOpen) {
    bot.chat('no chest found')
    return undefined
  }
  chestOpen = await bot.openChest(chestToOpen)

  chestOpen.once('updateSlot', (oldItem, newItem) => {
    bot.chat(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)}`)
  })
  chestOpen.once('close', () => {
    console.log('chest closed')
    chestOpen = undefined
  })

  return chestOpen
}

async function watchChest () {
  const chest = await openChest()
  if (!chest) {
    return
  }

  sayItems(chest.containerItems())
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

async function depositChest () {
  const chest = await openChest()

  const itemsToDeposit = bot.inventory.items()

  depositItem(chest, itemsToDeposit, 0)
}

function depositItem (chest, itemsToDeposit, currentItem) {
  if (itemsToDeposit.length <= currentItem) {
    setTimeout(() => {
      chest.close()
    }, 300)
    return
  }

  console.log(currentItem)
  console.log(itemsToDeposit[currentItem].name)
  console.log(itemsToDeposit[currentItem].type)
  console.log(itemsToDeposit[currentItem].count)

  chest.deposit(itemsToDeposit[currentItem].type, null, itemsToDeposit[currentItem].count, (err) => {
    if (err) {
      console.log(err)
    }
    depositItem(chest, itemsToDeposit, currentItem + 1)

    // setTimeout(() => {
    //   depositItem(chest, itemsToDeposit, currentItem + 1)
    // }, 200)
  })
}
