const mineflayer = require('mineflayer')
const inventoryViewer = require('mineflayer-web-inventory')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'ChestBot',
  password: process.argv[5]
})

bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version)
  inventoryViewer(bot, { port: 3001 })
  let chest, itemsToDeposit

  function getRandomItems () {
    const items = mcData.itemsArray
    for (let i = 0; i < 36; i++) {
      const item = items[Math.floor(Math.random() * items.length)]
      const stack = Math.floor(Math.random() * item.stackSize)
      bot.chat(`/give ${bot.username} ${item.name} ${stack}`)
    }
  }

  async function openChest () {
    const chestToOpen = bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 3
    })

    chest = await bot.openChest(chestToOpen)
    itemsToDeposit = bot.inventory.items()
    console.log('items to deposit', itemsToDeposit.map(i => `${i.name} x ${i.count}`))
    setTimeout(() => {
      depositItems()
    }, 350)
  }

  async function depositItems () {
    if (itemsToDeposit.length === 0) {
      setTimeout(() => {
        chest.close()
      }, 350)
      return
    }

    const itemToDeposit = itemsToDeposit.shift()
    console.log(`${itemToDeposit.name} x ${itemToDeposit.count} => ${itemToDeposit.type}`)
    await chest.deposit(itemToDeposit.type, null, itemToDeposit.count)
    setTimeout(() => {
      depositItems()
    }, 0)
  }

  getRandomItems()
  bot.chat('/kill @e[type=minecraft:item]')
  bot.chat('Hi im ready!')

  bot.on('chat', (username, message) => {
    if (message === 'start') {
      openChest()
    }
  })
})
