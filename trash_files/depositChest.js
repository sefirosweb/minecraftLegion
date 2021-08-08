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
  let chest, itemsToDeposit

  function getRandomItems() {
    const items = mcData.itemsArray
    for (let i = 0; i < 36; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const stack = Math.floor(Math.random() * item.stackSize)
      bot.chat(`/give ${bot.username} minecraft:${item.name} ${stack}`)
    }
  }

  async function openChest() {
    const chestToOpen = bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 3
    })

    chest = await bot.openChest(chestToOpen)
    itemsToDeposit = bot.inventory.items()
    console.log('items to deposit', itemsToDeposit.map(i => `${i.name} x ${i.count}`))
    depositItems()
  }

  async function depositItems() {
    if (itemsToDeposit.length === 0) {
      chest.close()
      return
    }

    const itemToDeposit = itemsToDeposit.shift()
    console.log(`${itemToDeposit.name} x ${itemToDeposit.count} => ${itemToDeposit.type}`)
    await chest.deposit(itemToDeposit.type, null, itemToDeposit.count)

    depositItems()

  }


  bot.chat('Hi im ready!')
  getRandomItems()
  bot.chat(`/kill @e[type=minecraft:item]`)

  setTimeout(() => {
    openChest()
  }, 1000)


})
