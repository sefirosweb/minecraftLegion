const fs = require("fs");
const util = require("util");
const copyFile = util.promisify(fs.copyFile);
const accessFile = util.promisify(fs.access);

require("module-alias/register");
const mineflayer = require("mineflayer");
const botWebsocket = require("@modules/botWebsocket");
const { server, port, customStart } = require("@config");
const createNewBot = require("./createNewBot");


console.log("Usage : node start_bot.js <botName> <botPassword>");
let botName = process.argv[2];
let botPassword = process.argv[3];

botName = process.argv[4] ? process.argv[4] : process.argv[2]; // npm run one botname password
botPassword = process.argv[5] ? process.argv[5] : process.argv[3]; // npm run one botname password

createNewBot(botName, botPassword, server, port, customStart)