import fs from 'fs'
import { Config, defaultConfig } from 'base-types'
import path from 'path'
import { Bot } from 'mineflayer'
import _ from 'lodash'

let bot: Bot

export const injectBotConfig = (_bot: Bot, botName: string) => {
  bot = _bot

  const dir = path.join(__dirname, '..', 'botConfig')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const botConfig = _.cloneDeep(defaultConfig)
  let save = false
  try {
    const dataFromFile = fs.readFileSync(path.join(dir, `${botName}.json`), 'utf8');
    const configFromFile = JSON.parse(dataFromFile) as Config
    Object.assign(botConfig, configFromFile)
  } catch (e) {
    console.log('Error loading config file, using default config')
    save = true
  }

  Object.assign(bot.config, botConfig)

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
