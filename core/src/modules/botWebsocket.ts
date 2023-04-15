import { Socket } from 'socket.io-client'
import type { BotFriends, BotwebsocketAction, Chest, Master, MineCords } from 'base-types'
import { Vec3 } from 'vec3'

import configBot from '@/config'

import botconfigLoader from '@/modules/botConfig'
import { isAnimal } from './animalType'
import { Entity } from 'prismarine-entity'
import { Bot } from 'mineflayer'
import { connectBotToServer } from '@/modules/connectSocket'
import { webSocketQueue } from './queues'

let socket: Socket
let friends: Array<BotFriends> = []
let masters: Array<Master> = []
let bot: Bot

function loadBot(_bot: Bot) {
  bot = _bot
}

const connect = async () => {
  const botconfig = botconfigLoader(bot.username)

  socket = await connectBotToServer()
  socket.on('update', (data) => console.log(data))
  socket.on('connect_error', (data) => console.log(data))
  socket.on('connect_failed', (data) => console.log(data))

  socket.on('connect', () => {
    console.log('Bot connected to webserver')
    socket.emit('addFriend', bot.username)
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

    setConfigurations['insertNewChest'] = () => {
      const chests = botconfig.getChests()
      const chest: Chest = {
        name: 'Input chest name',
        type: 'withdraw',
        position: new Vec3(0, 0, 0),
        dimension: 'overworld',
        items: []
      }
      chests.push(chest)
      botconfig.setChests(chests)
    }

    setConfigurations['job'] = (value) => {
      botconfig.setJob(value)
    }

    setConfigurations['pickUpItems'] = (value) => {
      botconfig.setPickUpItems(value)
    }

    setConfigurations['helpFriends'] = (value) => {
      botconfig.setHelpFriends(value)
    }

    setConfigurations['allowSprinting'] = (value) => {
      botconfig.setAllowSprinting(value)
    }

    setConfigurations['canDig'] = (value) => {
      botconfig.setCanDig(value)
    }

    setConfigurations['canSleep'] = (value) => {
      botconfig.setCanSleep(value)
    }

    setConfigurations['sleepArea'] = (value: { coord: string, pos: string }) => {
      const { coord, pos } = value
      let sleepArea = botconfig.getSleepArea()
      if (!sleepArea) {
        sleepArea = new Vec3(0, 0, 0)
      }

      if (coord === "x" || coord === "y" || coord === "z") {
        sleepArea[coord] = parseInt(pos)
      }

      botconfig.setSleepArea(sleepArea)
    }

    setConfigurations['canPlaceBlocks'] = (value) => {
      botconfig.setCanPlaceBlocks(value)
    }

    setConfigurations['firstPickUpItemsFromKnownChests'] = (value) => {
      botconfig.setFirstPickUpItemsFromKnownChests(value)
    }

    setConfigurations['canCraftItemWithdrawChest'] = (value) => {
      botconfig.setCanCraftItemWithdrawChest(value)
    }

    setConfigurations['mode'] = (value) => {
      botconfig.setMode(value)
    }

    setConfigurations['distance'] = (value) => {
      botconfig.setDistance(value)
    }

    setConfigurations['InsertItemToBeReady'] = (value) => {
      const itemsToBeReady = botconfig.getItemsToBeReady()
      itemsToBeReady.push({
        name: value.name,
        quantity: value.quantity
      })
      botconfig.setItemsToBeReady(itemsToBeReady)
    }

    setConfigurations['DeleteItemToBeReady'] = (value) => {
      const itemsToBeReady = botconfig.getItemsToBeReady()
      itemsToBeReady.splice(value, 1)
      botconfig.setItemsToBeReady(itemsToBeReady)
    }

    setConfigurations['InsertItemCanBeEat'] = () => {
      const itemsCanBeEat = botconfig.getItemsCanBeEat()
      itemsCanBeEat.push(config.value.name)
      botconfig.setItemsCanBeEat(itemsCanBeEat)
    }

    setConfigurations['deleteItemCanBeEat'] = (value) => {
      const itemsCanBeEat = botconfig.getItemsCanBeEat()
      itemsCanBeEat.splice(value, 1)
      botconfig.setItemsCanBeEat(itemsCanBeEat)
    }

    setConfigurations['moveItemCanBeEatNext'] = (value) => {
      const itemsCanBeEat = botconfig.getItemsCanBeEat()
      const index = value
      if (itemsCanBeEat.length > index + 1) {
        const temp = itemsCanBeEat[index]
        itemsCanBeEat[index] = itemsCanBeEat[index + 1]
        itemsCanBeEat[index + 1] = temp
        botconfig.setItemsCanBeEat(itemsCanBeEat)
      }
    }

    setConfigurations['moveItemCanBeEatPrev'] = (value) => {
      const itemsCanBeEat = botconfig.getItemsCanBeEat()
      const index = value
      if (index > 0) {
        const temp = itemsCanBeEat[index]
        itemsCanBeEat[index] = itemsCanBeEat[index - 1]
        itemsCanBeEat[index - 1] = temp
        botconfig.setItemsCanBeEat(itemsCanBeEat)
      }
    }

    setConfigurations['addPatrol'] = (value) => {
      const patrol = botconfig.getPatrol()
      patrol.push(value)
      botconfig.setPatrol(patrol)
    }

    setConfigurations['removePatrol'] = (value) => {
      const patrol = botconfig.getPatrol()
      patrol.splice(value, 1)
      botconfig.setPatrol(patrol)
    }

    setConfigurations['clearAllPositions'] = () => {
      botconfig.setPatrol([])
    }

    setConfigurations['copyPatrol'] = (value) => {
      const findMaster = bot.nearestEntity(
        (e) =>
          e.type === 'player' &&
          e.username === value &&
          e.mobType !== 'Armor Stand'
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

    setConfigurations['movePatrolNext'] = (value) => {
      const patrol = botconfig.getPatrol()
      const index = value
      if (patrol.length > index + 1) {
        const temp = patrol[index]
        patrol[index] = patrol[index + 1]
        patrol[index + 1] = temp
        botconfig.setPatrol(patrol)
      }
    }

    setConfigurations['movePatrolPrev'] = (value) => {
      const patrol = botconfig.getPatrol()
      const index = value
      if (index > 0) {
        const temp = patrol[index]
        patrol[index] = patrol[index - 1]
        patrol[index - 1] = temp
        botconfig.setPatrol(patrol)
      }
    }

    setConfigurations['savePositionHasMaster'] = (value) => {
      const findMaster = bot.nearestEntity(
        (e) =>
          e.type === 'player' &&
          e.username === value &&
          e.mobType !== 'Armor Stand'
      )
      if (!findMaster) {
        return
      }
      const patrol = botconfig.getPatrol()
      patrol.push(
        new Vec3(
          Math.round(findMaster.position.x * 10) / 10,
          Math.round(findMaster.position.y * 10) / 10,
          Math.round(findMaster.position.z * 10) / 10
        )
      )
      botconfig.setPatrol(patrol)
    }

    setConfigurations['changeTunnel'] = (value: string) => {
      const minerConfig = botconfig.getMinerCords()
      if (value === "horizontally" || value === "vertically") {
        minerConfig.tunel = value
      }
      botconfig.setMinerCords(minerConfig)
    }

    setConfigurations['changeOrientation'] = (value: string) => {
      const minerConfig = botconfig.getMinerCords()
      if (value === 'x+' || value === 'x-' || value === 'z+' || value === 'z-') {
        minerConfig.orientation = value
      }
      botconfig.setMinerCords(minerConfig)
    }

    setConfigurations['changeWorldMiner'] = (value: string) => {
      const minerConfig = botconfig.getMinerCords()
      if (value === 'overworld' || value === 'the_nether' || value === 'the_end') {
        minerConfig.world = value
      }
      botconfig.setMinerCords(minerConfig)
    }

    setConfigurations['changePosMiner'] = (value: { coord: string, pos: string }) => {
      const { coord, pos } = value
      const minerConfig = botconfig.getMinerCords()
      if (isMineCoords(coord)) {
        minerConfig[coord] = parseInt(pos);
      }
      botconfig.setMinerCords(minerConfig)
    }

    setConfigurations['changeReverseModeMiner'] = (value: boolean) => {
      const minerConfig = botconfig.getMinerCords()
      minerConfig.reverse = value
      botconfig.setMinerCords(minerConfig)
    }

    setConfigurations['insertNewChest'] = () => {
      const chests = botconfig.getChests()
      chests.push({
        name: 'Input chest name',
        type: 'withdraw',
        position: new Vec3(0, 0, 0),
        items: [],
        dimension: 'overworld'
      })
      botconfig.setChests(chests)
    }

    setConfigurations['deleteChest'] = (value) => {
      const chests = botconfig.getChests()
      chests.splice(value, 1)
      botconfig.setChests(chests)
    }

    setConfigurations['changeChestType'] = (value) => {
      const chests = botconfig.getChests()
      chests[value.chestId].type = value.value
      botconfig.setChests(chests)
    }

    setConfigurations['changeChestName'] = (value) => {
      const chests = botconfig.getChests()
      chests[value.chestId].name = value.value
      botconfig.setChests(chests)
    }

    setConfigurations['changeChestPos'] = (value: { chestId: number, coord: string, pos: string }) => {
      const { chestId, coord, pos } = value
      const chests = botconfig.getChests()

      if (coord === "x" || coord === "y" || coord === "z") {
        chests[chestId].position[coord] = parseInt(pos)
      }

      if (
        coord === "dimension" &&
        (pos === 'overworld' || pos === 'the_nether' || pos === 'the_end')
      ) {
        chests[chestId].dimension = pos
      }

      botconfig.setChests(chests)
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

      const chests = botconfig.getChests()
      chests[value.chestId].position = findMaster.position.floored()
      // @ts-ignore https://github.com/PrismarineJS/mineflayer/pull/2963
      chests[value.chestId].dimension = bot.game.dimension
      botconfig.setChests(chests)
    }

    setConfigurations['insertItemInChest'] = (value) => {
      const chests = botconfig.getChests()
      chests[value.chestId].items.push({
        name: value.name,
        quantity: value.quantity
      })
      botconfig.setChests(chests)
    }

    setConfigurations['removeItemFromChest'] = (value) => {
      const chests = botconfig.getChests()
      chests[value.chestId].items.splice(value.itemIndex, 1)
      botconfig.setChests(chests)
    }

    setConfigurations['moveChestNext'] = (value) => {
      const chests = botconfig.getChests()
      const index = value
      if (chests.length > index + 1) {
        const temp = chests[index]
        chests[index] = chests[index + 1]
        chests[index + 1] = temp
        botconfig.setChests(chests)
      }
    }

    setConfigurations['moveChestPrev'] = (value) => {
      const chests = botconfig.getChests()
      const index = value
      if (index > 0) {
        const temp = chests[index]
        chests[index] = chests[index - 1]
        chests[index - 1] = temp
        botconfig.setChests(chests)
      }
    }

    setConfigurations['insertNewPlantArea'] = () => {
      const plantAreas = botconfig.getPlantAreas()
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
      botconfig.setPlantAreas(plantAreas)
    }

    setConfigurations['changePlantArea'] = (value) => {
      const plantAreas = botconfig.getPlantAreas()
      plantAreas[value.id] = value.plantArea
      botconfig.setPlantAreas(plantAreas)
    }

    setConfigurations['deletePlantArea'] = (value) => {
      const plantAreas = botconfig.getPlantAreas()
      plantAreas.splice(value, 1)
      botconfig.setPlantAreas(plantAreas)
    }

    setConfigurations['insertNewFarmArea'] = (value) => {
      const farmAreas = botconfig.getFarmAreas()
      farmAreas.push({
        yLayer: 0,
        xStart: 0,
        xEnd: 0,
        zStart: 0,
        zEnd: 0
      })
      botconfig.setFarmAreas(farmAreas)
    }

    setConfigurations['changeFarmArea'] = (value) => {
      const farmAreas = botconfig.getFarmAreas()
      farmAreas[value.id] = value.farmArea
      botconfig.setFarmAreas(farmAreas)
    }

    setConfigurations['deleteFarmArea'] = (value) => {
      const farmAreas = botconfig.getFarmAreas()
      farmAreas.splice(value, 1)
      botconfig.setFarmAreas(farmAreas)
    }

    setConfigurations['changeAnimalValue'] = (data: {
      animal: string,
      value: string
    }) => {
      const { animal, value } = data
      if (isAnimal(animal)) {
        const farmAnimal = botconfig.getFarmAnimal()
        farmAnimal[animal] = parseInt(value)
        botconfig.setFarmAnimal(farmAnimal)
      }
    }

    setConfigurations['randomFarmArea'] = (value) => {
      botconfig.setRandomFarmArea(value)
    }

    setConfigurations['insertNewChestArea'] = () => {
      const chestArea = botconfig.getChestArea()
      chestArea.push({
        yLayer: 0,
        xStart: 0,
        xEnd: 0,
        zStart: 0,
        zEnd: 0
      })
      botconfig.setChestArea(chestArea)
    }

    setConfigurations['changeChestArea'] = (value) => {
      const chestArea = botconfig.getChestArea()
      chestArea[value.id] = value.chestArea
      botconfig.setChestArea(chestArea)
    }

    setConfigurations['deleteChestArea'] = (value) => {
      const chestArea = botconfig.getChestArea()
      chestArea.splice(value, 1)
      botconfig.setChestArea(chestArea)
    }

    setConfigurations['saveFullConfig'] = (value) => {
      botconfig.saveFullConfig(value)
    }


    setConfigurations[config.configToChange](config.value)

    sendConfig()
  })

  socket.on('getConfig', () => {
    sendConfig()
  })

  webSocketQueue.resume()
}

const sendConfig = () => {
  console.log('Sending back')
  const botconfig = botconfigLoader(bot.username)
  console.log(botconfig.getAll())

  socket.emit('sendAction', {
    action: 'sendConfig',
    value: botconfig.getAll()
  })
}

const sendAction = (action: string, value: any) => {
  socket.emit('sendAction', { action, value })
}

const emit = (channel: string, data: any) => {
  webSocketQueue.push({
    cb: () => socket.emit(channel, data)
  });
}

const emitHealth = (health: number) => {
  const data = {
    type: 'health',
    value: health
  }
  emit('botStatus', data)
}

const emitCombat = (combat: boolean) => {
  const data = {
    type: 'combat',
    value: combat
  }
  emit('botStatus', data)
}

const emitFood = (food: number) => {
  const data = {
    type: 'food',
    value: food
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
    cb: () => socket.emit('logs', data)
  });
}

const on = (listener: string, cb: (BotwebsocketAction: BotwebsocketAction) => void) => {
  webSocketQueue.push({
    cb: () => socket.on(listener, cb)
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
  const botconfig = botconfigLoader(bot.username)
  if (!masterPointListener) return
  const master = masterPointListener

  if (prevPoint === undefined || master.position.distanceTo(prevPoint) > 3) {
    const patrol = botconfig.getPatrol()
    patrol.push(
      new Vec3(
        Math.round(master.position.x * 10) / 10,
        Math.round(master.position.y * 10) / 10,
        Math.round(master.position.z * 10) / 10
      )
    )
    prevPoint = master.position.clone()
    botconfig.setPatrol(patrol)
    sendConfig()
  }
}

const botWebsocketLoader = {
  loadBot,
  connect,
  on,
  emit,
  log,
  emitHealth,
  emitFood,
  emitCombat,
  emitEvents,
  getFriends,
  getMasters,
  sendAction
}

const isMineCoords = (value: string): value is keyof MineCords => {
  const typesMineCord: Array<string> = ['xStart', 'xEnd', 'yEnd', 'yStart', 'zEnd', 'zStart']
  return typesMineCord.includes(value)
}

export default botWebsocketLoader