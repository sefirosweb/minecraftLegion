require('module-alias/register')
const mineflayer = require('mineflayer')
if (process.argv.length < 2 || process.argv.length > 6) {
  console.log('Usage : node craft.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2] ? process.argv[2] : 'host.docker.internal',
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'crafter',
  password: process.argv[5]
})

bot.once('login', () => {
  bot.chat('Hello world, im crafter')
  bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    craftItem(message, 20)
  })

  craftItem('iron_sword', 1)

  async function craftItem (name, amount) {
    const { getResumeInventory } = require('@modules/inventoryModule')(bot)

    // amount = parseInt(amount, 10);
    const mcData = require('minecraft-data')(bot.version)
    const item = mcData.itemsByName[name]

    const craftingTableID = mcData.blocksByName.crafting_table.id

    const craftingTable = bot.findBlock({
      matching: craftingTableID,
      maxDistance: 3
    })

    if (!item) {
      bot.chat(`unknown name: ${name}`)
      return
    }
    const aviableRecipes = bot.recipesAll(item.id, null, craftingTable)
    // const itemsForRecipes = recipesUtils.getItemsFromRecipe(aviableRecipes)
    const resumeInventory = getResumeInventory()

    let enoughItems = false
    for (let r = 0; r < aviableRecipes.length; r++) {
      let validRecipe = true
      for (let i = 0; i < aviableRecipes[r].delta.length; i++) {
        if (aviableRecipes[r].delta[i].count > 0) {
          continue
        }

        const itemInventory = resumeInventory.find(
          (inv) => inv.type === aviableRecipes[r].delta[i].id
        )
        if (
          !itemInventory ||
          itemInventory.quantity < Math.abs(aviableRecipes[r].delta[i].count)
        ) {
          validRecipe = false
          break
        }
      }
      if (validRecipe) {
        enoughItems = true
        break
      }
    }

    if (!enoughItems) {
      bot.chat(`No enough items for ${name}`)
      return
    }

    const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]

    if (!recipe && !craftingTable) {
      bot.chat(`No crafting table near, and needs for ${name}`)
      return
    }

    if (!recipe) {
      bot.chat(`I cannot make ${name}`)
      return
    }

    bot
      .craft(recipe, amount, craftingTable)
      .then(() => {
        bot.chat(`did the recipe for ${name} ${amount} times`)
      })
      .catch((err) => {
        bot.chat(`error making ${name}`)
        console.log(err.message)
      })
  }
})
