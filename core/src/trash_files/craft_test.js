const mineflayer = require("mineflayer");
if (process.argv.length < 2 || process.argv.length > 6) {
  console.log("Usage : node craft.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

const bot = mineflayer.createBot({
  host: process.argv[2] ? process.argv[2] : "localhost",
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : "crafter",
  password: process.argv[5],
});

bot.once("login", () => {
  bot.chat("Hello world, im crafter");
  bot.chat("/clear");
  bot.chat("/gamemode survival");
  setTimeout(() => {
    bot.chat("/give crafter minecraft:quartz 256");

    setTimeout(async () => {
      const item = bot.registry.itemsByName["quartz_block"];

      const craftingTable = bot.findBlock({
        matching: bot.registry.blocksByName.crafting_table.id,
        maxDistance: 3,
      });

      const recipe = bot.recipesAll(item.id, null, 1, true)[0];

      console.log({recipe})

      // for (let i = 0; i < 1; i += 1) {
      //   await bot.craft(recipe, 64, craftingTable);
      // }
      await bot.craft(recipe, 64, craftingTable);

      console.log(bot.inventory.items());
    }, 2000);
  }, 2000);
});
