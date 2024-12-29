import { Bot } from '@/types'
import { Config } from 'base-types'
import { Socket } from 'socket.io-client'
import { create } from 'zustand'

type Log = {
    botName: string
    message: string
    socketId: string
    time: string
}

type Store = {
    logs: Array<Log>
    setLogs: (logs: Array<Log>) => void,
    addLog: (newLog: Log) => void,

    botsOnline: Array<Bot>,
    setBotsOnline: (botsOnline: Array<Bot>) => void,
    updateBotStatus: (botDataStatus: { type: keyof Bot, value: any, socketId: string }) => void,
    setConfig: (botConfig: Config & { socketId: string }) => void,

    masters: Array<string>,
    setMasters: (masters: Array<string>) => void,

    chests: Record<string, any>,
    setChests: (chests: Record<string, any>) => void,

    portals: Record<string, any>,
    setPortals: (portals: Record<string, any>) => void,

    coreConnected: Boolean,
    setCoreConnected: (coreConnected: Boolean) => void,

    socket: Socket | null,
    setSocket: (socket: Socket | null) => void,

    master: string,
    setMaster: (master: string) => void,

    loged: boolean
    setLoged: (loged: boolean) => void,
}


export const useStore = create<Store>((set, get) => ({
    logs: [],
    setLogs: (logs) => set(() => ({ logs })),
    addLog: (newLog: Log) => set((state) => {
        if (state.logs.length > 1000) state.logs.shift()
        return { logs: [...state.logs, newLog] }
    }),

    botsOnline: [],
    setBotsOnline: (botsOnline) => set(() => ({ botsOnline })),
    updateBotStatus: ({ type, value, socketId }) => set((state) => {
        const botIndex = state.botsOnline.findIndex((e) => e.socketId === socketId);
        if (botIndex === -1) return state;

        const newBotsOnline = [...state.botsOnline];
        newBotsOnline[botIndex] = { ...newBotsOnline[botIndex], [type]: value };

        return { botsOnline: newBotsOnline };
    }),
    setConfig: (botConfig) => set((state) => {
        const botIndex = state.botsOnline.findIndex((e) => e.socketId === botConfig.socketId);
        if (botIndex === -1) return state;

        const newBotsOnline = [...state.botsOnline];
        newBotsOnline[botIndex] = { ...newBotsOnline[botIndex], config: botConfig };

        return { botsOnline: newBotsOnline };
    }),

    masters: [],
    setMasters: (masters) => set(() => ({ masters })),

    chests: {},
    setChests: (chests) => set(() => ({ chests })),

    portals: {},
    setPortals: (portals) => set(() => ({ portals })),

    coreConnected: false,
    setCoreConnected: (coreConnected) => set(() => ({ coreConnected })),

    socket: null,
    setSocket: (socket) => set(() => ({ socket })),

    master: localStorage.getItem('master') ?? 'PlayerName',
    setMaster: (master) => {
        localStorage.setItem('master', master);
        set(() => ({ master }))
    },

    loged: localStorage.getItem('logedIn') === 'true',
    setLoged: (loged) => {
        localStorage.setItem('logedIn', loged ? 'true' : 'false');
        set(() => ({ loged }))
    },

}))