import mineflayer, { Bot } from "mineflayer";
import customStartLoader from "@/custom_start/custom"
import { botWebsocket } from "@/modules";
import mcDataLoader from 'minecraft-data'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import hawkEye from 'minecrafthawkeye'
import StartStateMachine from '@/NestedStateModules/MainStateMachine'
import { injectBotConfig } from "@/modules";
import { Vec3 } from "vec3";
import { Config, defaultConfig } from "base-types";
import { cloneDeep } from 'lodash'

export type Props = {
  botName?: string;
  botPassword?: string;
  server: string;
  port?: number;
  customStart?: boolean,
  version?: string
}


export const createNewBot = (props: Props): Bot => {
  const {
    botName = 'Legion',
    botPassword,
    server,
    port = 25565,
    customStart = false,
    version = undefined
  } = props

  const bot = mineflayer.createBot({
    username: botName,
    host: server,
    port: port,
    version,
    checkTimeoutInterval: 10000 * 60 * 5,
  })

  const botConfig = new Proxy(cloneDeep(defaultConfig), {
    set: <K extends keyof Config>(target: Config, property: K, value: Config[K]) => {
      if (typeof property === 'string') {

        if (property === 'sleepArea') {
          // @ts-ignore
          value = !value || isNaN(parseFloat(value.x)) || isNaN(parseFloat(value.y)) || isNaN(parseFloat(value.z)) ? undefined : new Vec3(parseFloat(value.x), parseFloat(value.y), parseFloat(value.z))
        }

        if (property === 'patrol') {
          // @ts-ignore
          value = value.map(p => new Vec3(p.x, p.y, p.z));
        }

        if (property === 'chests') {
          // @ts-ignore
          value = value.map(c => ({
            ...c,
            position: new Vec3(c.position.x, c.position.y, c.position.z)
          }))
        }

        target[property] = value;
      }
      return true;
    }
  });

  bot.config = botConfig

  botWebsocket.loadBot(bot);

  bot.setMaxListeners(0);
  bot.once("inject_allowed", () => {
    bot.loadPlugin(mineflayerPathfinder.pathfinder);
    bot.loadPlugin(hawkEye)
    injectBotConfig(bot, botName);
    const mcData = mcDataLoader(bot.version)
    mcData.blocksArray[826].hardness = 3 // hotfix until wait a final relase
    mcData.blocksArray[274].boundingBox = 'block' // hot fix for cross the portal of the end
    bot.mcData = mcData
    console.log('\x1b[33m%s\x1b[0m', 'Injected pathfinder');
  });

  bot.once("kicked", (reason) => {
    console.log(reason);
    process.exit();
  });

  bot.once("error", (error) => {
    botWebsocket.log("Error bot detected " + JSON.stringify(error));
    console.log(error);
    process.exit();
  });

  bot.once("spawn", () => {
    console.log('\x1b[33m%s\x1b[0m', bot.version);
    bot.chat(`/login ${botPassword}`)
    botWebsocket.connect();
    botWebsocket.log("Ready!");

    if (customStart) {
      const { start } = customStartLoader(bot);
      start().then(() => {
        StartStateMachine(bot);
      });
    } else {
      StartStateMachine(bot);
    }
  });

  return bot;
}
