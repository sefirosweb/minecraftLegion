const fs = require("fs");
const util = require("util");
const copyFile = util.promisify(fs.copyFile);
const accessFile = util.promisify(fs.access);

require("module-alias/register");
const mineflayer = require("mineflayer");
const botWebsocket = require("@modules/botWebsocket");
const { server, port, customStart } = require("@config");

console.log("Usage : node start_bot.js <botName> <botPassword>");
let botName = process.argv[2];
let botPassword = process.argv[3];

botName = process.argv[4] ? process.argv[4] : process.argv[2]; // npm run one botname password
botPassword = process.argv[5] ? process.argv[5] : process.argv[3]; // npm run one botname password

createNewBot(botName, botPassword);

function createNewBot(botName, botPassword = "") {
  const bot = mineflayer.createBot({
    username: botName,
    host: server,
    port: port,
  });

  botWebsocket.loadBot(bot);
  bot.setMaxListeners(0);
  bot.once("inject_allowed", () => {
    bot.loadPlugin(require("mineflayer-pathfinder").pathfinder);
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
    console.log(bot.version);
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
}
