import { Socket } from "socket.io"
import { findBotBySocket } from '@/libs/botStore'
import { BotsConnected, Portals } from "base-types"

export type SocketProps = {
    botsConnected: Array<BotsConnected>
    masters: Array<string>
    findBotBySocket: (socket: Socket) => BotsConnected | undefined
    chests: any
    setChests: (chests: any) => void
    portals: Portals
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
    findBotBySocket,
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