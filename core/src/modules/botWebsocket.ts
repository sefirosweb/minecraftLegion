import { Socket } from 'socket.io-client'
import type { BotFriends, BotwebsocketAction, Chest, Master, MineCords } from 'base-types'
import { Vec3 } from 'vec3'

import configBot from '@/config'

import { isAnimal } from './animalType'
import { Entity } from 'prismarine-entity'
import { Bot } from 'mineflayer'
import { connectBotToServer } from '@/modules/connectSocket'
import { webSocketQueue } from './queues'
import { saveBotConfig } from './botConfig'

let socket: Socket
let friends: Array<BotFriends> = []
let masters: Array<Master> = []
let bot: Bot

function loadBot(_bot: Bot) {
  bot = _bot
}

const connect = async () => {
  socket = await connectBotToServer()
  if (!socket) return
  socket.on('update', (data) => console.log(data))
  socket.on('connect_error', (data) => console.log(data))
  socket.on('connect_failed', (data) => console.log(data))

  socket.on('connect', () => {
    console.log('Bot connected to webserver')
    emit('isBot', bot.username)
  })

  socket.on('disconnect', () => {
    console.log('Disconected from webserver')
  })

  socket.on('sendDisconnect', () => {
    process.exit(0)
  })

  socket.on('botsOnline', (botsOnline) => {
    friends = botsOnline
  })

  socket.on('botStatus', (data: { type: 'health' | 'food' | 'combat', socketId: string, value: string }) => {
    const { socketId, type, value } = data

    const botIndex = friends.findIndex((e) => e.socketId === socketId)
    if (botIndex >= 0) {
      const friendUpdate = [...friends]

      const botToUpdate = friendUpdate[botIndex]

      if (type === "food" || type === "health") {
        botToUpdate[type] = value // TODO pending to check
      }

      if (type === "combat") {
        botToUpdate[type] = value === "true" // TODO pending to check
      }

      friends = friendUpdate
    }
  })

  socket.on('mastersOnline', (mastersOnline) => {
    masters = mastersOnline
  })

  socket.on('changeConfig', (config) => {
    const setConfigurations: Record<string, (...args: any) => void> = {}

    setConfigurations['job'] = (value) => {
      bot.config.job = value
    }

    setConfigurations['pickUpItems'] = (value) => {
      bot.config.pickUpItems = value
    }

    setConfigurations['helpFriends'] = (value) => {
      bot.config.helpFriends = value
    }

    setConfigurations['allowSprinting'] = (value) => {
      bot.config.allowSprinting = value
    }

    setConfigurations['canDig'] = (value) => {
      bot.config.canDig = value
    }

    setConfigurations['canSleep'] = (value) => {
      bot.config.canSleep = value
    }

    setConfigurations['sleepArea'] = (value: { coord: string, pos: string }) => {
      const { coord, pos } = value
      const sleepArea = bot.config.sleepArea || new Vec3(0, 0, 0,)

      if (coord === "x" || coord === "y" || coord === "z") {
        sleepArea[coord] = parseInt(pos)
      }

      bot.config.sleepArea = sleepArea
    }

    setConfigurations['canPlaceBlocks'] = (value) => {
      bot.config.canPlaceBlocks = value
    }

    setConfigurations['mode'] = (value) => {
      bot.config.mode = value
    }

    setConfigurations['distance'] = (value) => {
      bot.config.distance = value
    }

    setConfigurations['deleteItemToBeReady'] = (value) => {
      const itemsToBeReady = bot.config.itemsToBeReady
      itemsToBeReady.splice(value, 1)
      bot.config.itemsToBeReady = itemsToBeReady
    }

    setConfigurations['copyPatrol'] = (value) => {
      const findMaster = bot.nearestEntity(
        (e) =>
          e.type === 'player' &&
          e.username === value &&
          e.displayName !== 'Armor Stand'
      )
      if (!findMaster) {
        return
      }

      if (!isEventLoaded) {
        prevPoint = undefined
        isEventLoaded = true
        masterPointListener = findMaster
        bot.on('customEventPhysicTick', nextPointListener)
      } else {
        bot.removeListener('customEventPhysicTick', nextPointListener)
        isEventLoaded = false
      }
    }

    setConfigurations['savePositionHasMaster'] = (value) => {
      const findMaster = bot.nearestEntity(
        (e) =>
          e.type === 'player' &&
          e.username === value &&
          e.displayName !== 'Armor Stand'
      )
      if (!findMaster) {
        return
      }
      const patrol = bot.config.patrol
      patrol.push(
        new Vec3(
          Math.round(findMaster.position.x * 10) / 10,
          Math.round(findMaster.position.y * 10) / 10,
          Math.round(findMaster.position.z * 10) / 10
        )
      )
      bot.config.patrol = patrol
    }

    setConfigurations['changeOrientation'] = (value: string) => {
      const minerCords = bot.config.minerCords
      if (value === 'x+' || value === 'x-' || value === 'z+' || value === 'z-') {
        minerCords.orientation = value
      }
      bot.config.minerCords = minerCords
    }

    setConfigurations['changeWorldMiner'] = (value: string) => {
      const minerCords = bot.config.minerCords
      if (value === 'overworld' || value === 'the_nether' || value === 'the_end') {
        minerCords.world = value
      }
      bot.config.minerCords = minerCords
    }

    setConfigurations['changeReverseModeMiner'] = (value: boolean) => {
      const minerCords = bot.config.minerCords
      minerCords.reverse = value
      bot.config.minerCords = minerCords
    }

    setConfigurations['changeChestPosMaster'] = (value) => {
      const findMaster = bot.nearestEntity(
        (e) =>
          e.type === 'player' &&
          e.username === value.master
      )
      if (!findMaster) {
        return
      }

      const chests = bot.config.chests
      chests[value.chestId].position = findMaster.position.floored()
      // @ts-ignore https://github.com/PrismarineJS/mineflayer/pull/2963
      chests[value.chestId].dimension = bot.game.dimension
      bot.config.chests = chests
    }

    setConfigurations['insertNewPlantArea'] = () => {
      const plantAreas = bot.config.plantAreas
      plantAreas.push({
        layer: {
          xEnd: 0,
          xStart: 0,
          yLayer: 0,
          zEnd: 0,
          zStart: 0
        },
        plant: ""
      })
      bot.config.plantAreas = plantAreas
    }

    setConfigurations['changePlantArea'] = (value) => {
      const plantAreas = bot.config.plantAreas
      plantAreas[value.id] = value.plantArea
      bot.config.plantAreas = plantAreas
    }

    setConfigurations['deletePlantArea'] = (value) => {
      const plantAreas = bot.config.plantAreas
      plantAreas.splice(value, 1)
      bot.config.plantAreas = plantAreas
    }

    setConfigurations['insertNewFarmArea'] = (value) => {
      const farmAreas = bot.config.farmAreas
      farmAreas.push({
        yLayer: 0,
        xStart: 0,
        xEnd: 0,
        zStart: 0,
        zEnd: 0
      })
      bot.config.farmAreas = farmAreas
    }

    setConfigurations['changeFarmArea'] = (value) => {
      const farmAreas = bot.config.farmAreas
      farmAreas[value.id] = value.farmArea
      bot.config.farmAreas = farmAreas
    }

    setConfigurations['deleteFarmArea'] = (value) => {
      const farmAreas = bot.config.farmAreas
      farmAreas.splice(value, 1)
      bot.config.farmAreas = farmAreas
    }

    setConfigurations['changeAnimalValue'] = (data: {
      animal: string,
      value: string
    }) => {
      const { animal, value } = data
      if (isAnimal(animal)) {
        const farmAnimal = bot.config.farmAnimal
        farmAnimal[animal] = parseInt(value)
        bot.config.farmAnimal = farmAnimal
      }
    }

    setConfigurations['randomFarmArea'] = (value) => {
      bot.config.randomFarmArea = value
    }

    setConfigurations['insertNewChestArea'] = () => {
      const chestArea = bot.config.chestAreas
      chestArea.push({
        yLayer: 0,
        xStart: 0,
        xEnd: 0,
        zStart: 0,
        zEnd: 0
      })
      bot.config.chestAreas = chestArea
    }

    setConfigurations['changeChestArea'] = (value) => {
      const chestArea = bot.config.chestAreas
      chestArea[value.id] = value.chestArea
      bot.config.chestAreas = chestArea
    }

    setConfigurations['deleteChestArea'] = (value) => {
      const chestArea = bot.config.chestAreas
      chestArea.splice(value, 1)
      bot.config.chestAreas = chestArea
    }

    setConfigurations['saveFullConfig'] = (value) => {
      bot.config = value
    }


    try {
      setConfigurations[config.configToChange](config.value)
    } catch (e) {
      console.error('Error on saving configuration')
      console.error(e)
    }

    saveBotConfig()
    sendConfig()
  })

  socket.on('getConfig', (data, response) => {
    response(bot.config);
  })

  socket.on('get_master_position', (data: { master: string }, response) => {
    const { master } = data

    const findMaster = bot.nearestEntity(
      (e) =>
        e.type === 'player' &&
        e.username === master &&
        e.displayName !== 'Armor Stand'
    )
    if (!findMaster) {
      response({ error: 'Master not found' });
      return
    }

    response({ pos: findMaster.position });
  })

  webSocketQueue.resume()
}

const sendConfig = () => {
  emit('sendAction', {
    action: 'sendConfig',
    value: bot.config
  })
}

const sendAction = (action: string, value: any) => {
  emit('sendAction', { action, value })
}

const emit = (channel: string, data: any) => {
  webSocketQueue.push({
    cb: async () => {
      socket.emit(channel, data)
    }
  });
}

const emitCombat = (combat: boolean) => {
  const data = {
    type: 'combat',
    value: combat
  }
  emit('botStatus', data)
}

const emitEvents = (events: Array<string>) => {
  const data = {
    type: 'events',
    value: events
  }
  emit('botStatus', data)
}

const log = (data: string) => {
  webSocketQueue.push({
    cb: async () => {
      socket.emit('logs', data)
    }
  });
}

const on = (listener: string, cb: (BotwebsocketAction: BotwebsocketAction, response?: (data?: any) => void) => void) => {
  webSocketQueue.push({
    cb: async () => {
      socket.on(listener, cb)
    }
  });
}

const getFriends = () => {
  return friends
}

const getMasters = () => {
  const allMasters = masters.concat(configBot.masters) // Gef offline + online config
  return allMasters
}

let prevPoint: Vec3 | undefined
let isEventLoaded = false
let masterPointListener: Entity | undefined
const nextPointListener = () => {
  if (!masterPointListener) return
  const master = masterPointListener

  if (prevPoint === undefined || master.position.distanceTo(prevPoint) > 3) {
    const patrol = bot.config.patrol
    patrol.push(
      new Vec3(
        Math.round(master.position.x * 10) / 10,
        Math.round(master.position.y * 10) / 10,
        Math.round(master.position.z * 10) / 10
      )
    )
    prevPoint = master.position.clone()
    bot.config.patrol = patrol
    sendConfig()
  }
}

const botWebsocketLoader = {
  loadBot,
  connect,
  on,
  emit,
  log,
  emitCombat,
  emitEvents,
  getFriends,
  getMasters,
  sendAction
}

export default botWebsocketLoader