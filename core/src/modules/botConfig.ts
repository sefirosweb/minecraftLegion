import fs from 'fs'
import { Config, defaultConfig } from 'base-types'
import path from 'path'
import { Vec3 } from 'vec3'
import { Bot } from 'mineflayer'

let bot: Bot

export default (_bot: Bot, botName: string) => {
  bot = _bot

  const dir = path.join(__dirname, '..', 'botConfig')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const botConfig = structuredClone(defaultConfig)
  let save = false
  try {
    const dataFromFile = fs.readFileSync(path.join(dir, `${botName}.json`), 'utf8');
    const configFromFile = JSON.parse(dataFromFile) as Config
    Object.assign(botConfig, configFromFile)
  } catch (e) {
    console.log('Error loading config file, using default config')
    save = true
  }

  bot.config = botConfig

  if (bot.config.sleepArea) {
    bot.config.sleepArea = new Vec3(bot.config.sleepArea.x, bot.config.sleepArea.y, bot.config.sleepArea.z)
  }

  // Transform JSON raw data into Object types
  bot.config.patrol = bot.config.patrol.map(p => new Vec3(p.x, p.y, p.z))
  bot.config.chests = bot.config.chests.map(c => ({
    ...c,
    position: new Vec3(c.position.x, c.position.y, c.position.z)
  }))

  if (save) {
    saveBotConfig(botName)
  }
}

export const saveBotConfig = async (botName?: string) => {
  const dir = path.join(__dirname, '..', 'botConfig')

  try {
    await fs.promises.access(dir, fs.constants.F_OK)
  } catch (e) {
    await fs.promises.mkdir(dir)
  }


  botName = botName || bot.username
  const data = JSON.stringify(bot.config);
  await fs.promises.writeFile(path.join(dir, `${botName}.json`), data);
}
