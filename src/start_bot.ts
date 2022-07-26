require("module-alias/register");
// @ts-ignore
import config from "./config";

console.log(config)
const { server, port, customStart } = config

// @ts-ignore
import createNewBot from "./createNewBot"


console.log("Usage : node start_bot.js <botName> <botPassword>");
let botName = process.argv[2];
let botPassword = process.argv[3];

botName = process.argv[4] ? process.argv[4] : process.argv[2]; // npm run one botname password
botPassword = process.argv[5] ? process.argv[5] : process.argv[3]; // npm run one botname password

createNewBot(botName, botPassword, server, port, customStart)