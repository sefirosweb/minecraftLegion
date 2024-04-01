import { Socket } from 'socket.io-client'
import type { BotFriends, BotwebsocketAction, Config, Master } from 'base-types'
import { Vec3 } from 'vec3'

import configBot from '@/config'

import { Entity } from 'prismarine-entity'
import { Bot } from 'mineflayer'
import { connectBotToServer } from '@/modules/connectSocket'
import { webSocketQueue } from './queues'
import { fixConfigTypes, saveBotConfig } from './botConfig'

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

  socket.on('getConfig', (_, response) => {
    response(bot.config);
  })

  socket.on('saveConfig', ({ botConfig }: { botConfig: Config }, response) => {
    bot.config = botConfig
    saveBotConfig()
    response({ success: true });
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

  socket.on('start_copy_master_position', (data: { master: string, masterSocketId: string }, response) => {
    const { master, masterSocketId: masterSocketIdSession } = data

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

    prevPoint = undefined
    if (!isEventLoaded) {
      isEventLoaded = true
      masterPointListener = findMaster
      masterSocketId = masterSocketIdSession
      bot.on('customEventPhysicTick', nextPointListener)
    } else {
      bot.removeListener('customEventPhysicTick', nextPointListener)
      isEventLoaded = false
      masterSocketId = undefined
      masterPointListener = undefined
    }

    response({ success: true, isCopingPatrol: isEventLoaded });
  })

  webSocketQueue.resume()
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
let masterSocketId: string | undefined
const nextPointListener = () => {
  if (!masterPointListener) return
  const master = masterPointListener

  if (prevPoint === undefined || master.position.distanceTo(prevPoint) > 3) {
    const pos = new Vec3(
      Math.round(master.position.x * 10) / 10,
      Math.round(master.position.y * 10) / 10,
      Math.round(master.position.z * 10) / 10
    )

    socket.emit('sendDirectMessage', masterSocketId, {
      type: 'add_guard_position',
      message: pos
    });
    console.log('Sent direct message:', master.position);
    prevPoint = master.position.clone()
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