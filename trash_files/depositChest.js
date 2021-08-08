const mineflayer = require('mineflayer')

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
  setTimeout(() => {
    openChest()
  }, 1000)

  let chest, itemsToDeposit
  async function openChest () {
    const chestToOpen = bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 3
    })

    chest = await bot.openChest(chestToOpen)
    itemsToDeposit = bot.inventory.items()
    depositItems()
  }

  async function depositItems () {
    if (itemsToDeposit.length === 0) {
      chest.close()
      return
    }

    const itemToDeposit = itemsToDeposit.shift()

    console.log(itemToDeposit.name)
    console.log(itemToDeposit.type)
    console.log(itemToDeposit.count)

    await chest.deposit(itemToDeposit.type, null, itemToDeposit.count)

    depositItems()
  }
})
