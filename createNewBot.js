const fs = require("fs");
const util = require("util");
const copyFile = util.promisify(fs.copyFile);
const accessFile = util.promisify(fs.access);

require("module-alias/register");
const mineflayer = require("mineflayer");
const botWebsocket = require("@modules/botWebsocket");

const createNewBot = (botName, botPassword = "", server, port, customStart) => {
  const bot = mineflayer.createBot({
    username: botName,
    host: server,
    port: port
  });

  botWebsocket.loadBot(bot);
  bot.setMaxListeners(0);
  bot.on("inject_allowed", () => {
    const mcData = require('minecraft-data')(bot.version)
    mcData.blocksArray[826].hardness = 3 // hotfix until wait a final relase
    mcData.blocksArray[274].boundingBox = 'block'
    bot.loadPlugin(require("mineflayer-pathfinder").pathfinder);
    console.log('\x1b[33m%s\x1b[0m', 'Injected pathfinder');
  });

  bot.once("kicked", (reason) => {
    const reasonDecoded = JSON.parse(reason);
    console.log(reasonDecoded);
    process.exit();
  });

  bot.once("error", (error) => {
    botWebsocket.log("Error bot detected " + JSON.stringify(error));
    console.log(error);
    process.exit();
  });

  bot.once("spawn", async () => {
    console.log('\x1b[33m%s\x1b[0m', bot.version);
    console.log('\x1b[33m%s\x1b[0m', 'Spawned');
    bot.chat(`/login ${botPassword}`)
    botWebsocket.connect();
    botWebsocket.log("Ready!");

    if (customStart) {
      const customFilePath = "./custom_start/custom.js";

      accessFile(customFilePath)
        .catch((err) => {
          const exampleFile = "./custom_start/custom_example.js";
          return copyFile(exampleFile, customFilePath);
        })
        .then(() => {
          const customStart = require(customFilePath)(bot);
          return customStart.start();
        })
        .then(() => {
          require("@NestedStateModules/startStateMachine")(bot);
        });
    } else {
      require("@NestedStateModules/startStateMachine")(bot);
    }
  });

  return bot
}

module.exports = createNewBot