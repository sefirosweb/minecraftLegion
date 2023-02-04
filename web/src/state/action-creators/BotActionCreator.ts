//@ts-nocheck
import { BotsType } from "../action-types";
import { Dispatch } from "redux";
import { BotsAction } from "../actions";
import { InitialState } from "../reducers/botsReducer"
import { State } from "../reducers";

export const setBots = (bots: InitialState["botsOnline"]) => (dispatch: Dispatch<BotsAction>) => {
    dispatch({
        type: BotsType.SET_BOTS,
        payload: bots
    })
}

export const addLog = (newLog: string) => (dispatch: Dispatch<BotsAction>, getState: () => State) => {
    const { logs } = getState().botsReducer
    const newLogs = [...logs, newLog]
    if (newLogs.length > 1000) {
        newLogs.shift()
    }

    dispatch({
        type: BotsType.SET_LOGS,
        payload: newLogs
    })
}

export const updateBotStatus = (botDataStatus) => (dispatch: Dispatch<BotsAction>, getState: () => State) => {
    const { botsOnline } = getState().botsReducer
    const botIndex = botsOnline.findIndex((e) => { return e.socketId === botDataStatus.socketId })

    const botsOnlineUpdate = [
        ...botsOnline
    ]
    botsOnlineUpdate[botIndex][botDataStatus.type] = botDataStatus.value

    dispatch({
        type: BotsType.SET_BOTS,
        payload: botsOnlineUpdate
    })
}

export const updateMasters = (newMasters: InitialState["masters"]) => (dispatch: Dispatch<BotsAction>) => {
    dispatch({
        type: BotsType.SET_MASTERS,
        payload: newMasters
    })
}

export const updateChests = (newChests) => (dispatch: Dispatch<BotsAction>) => {
    dispatch({
        type: BotsType.SET_CHESTS,
        payload: newChests
    })
}

export const updatePortals = (newPortals) => (dispatch: Dispatch<BotsAction>) => {
    dispatch({
        type: BotsType.SET_PORTALS,
        payload: newPortals
    })
}

export const setConfig = (botConfig) => (dispatch: Dispatch<BotsAction>, getState: () => State) => {
    const { botsOnline } = getState().botsReducer
    const botIndex = botsOnline.findIndex((e) => { return e.socketId === botConfig.socketId })

    const botsOnlineUpdate = [
        ...botsOnline
    ]
    botsOnlineUpdate[botIndex].config = botConfig

    dispatch({
        type: BotsType.SET_BOTS,
        payload: botsOnlineUpdate
    })
}

export const getBotBySocketId = (socketId: string) => (dispatch: Dispatch<BotsAction>, getState: () => State) => {
    const { botsOnline } = getState().botsReducer
    const bot = botsOnline.find((e) => { return e.socketId === socketId })
    return bot
}