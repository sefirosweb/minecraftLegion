import { io } from "@/server"
import { BotsConnected, Config } from "@/types"
import { Socket } from "socket.io"
import { sendMastersOnline } from '@/socketEmit/sendMastersOnline'
import { findBotBySocket } from '@/libs/botStore'
import { defaultConfig } from "@/types/types";

export type SocketProps = {
    io: typeof io
    botsConnected: Array<BotsConnected>
    defaultConfig: Config
    masters: Array<string>
    findBotBySocket: (socket: Socket) => BotsConnected | undefined
    sendMastersOnline: () => void
    chests: any
    setChests: (chests: any) => void
    portals: any
    setPortals: (portals: any) => void
}

const setChests = (chests: any) => {
    socketVariables.chests = chests
}

const setPortals = (portals: any) => {
    socketVariables.portals = portals
}

export const socketVariables: SocketProps = {
    masters: [],
    botsConnected: [],
    defaultConfig,
    io,
    findBotBySocket,
    sendMastersOnline,
    chests: {},
    setChests,
    portals: {
        overworld_to_the_end: [],
        overworld_to_the_nether: [],
        the_end_to_overworld: [],
        the_nether_to_overworld: []
    },
    setPortals
}