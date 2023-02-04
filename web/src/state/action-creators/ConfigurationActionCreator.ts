
import { ConfigurationType } from "../action-types";
import { Dispatch } from "redux";
import { ConfiguracionAction } from "../actions";
import { InitialState } from "../reducers/configurationReducer"


export const setSocket = (socket: InitialState["socket"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_SOCKET,
        payload: socket
    })
}

export const setSelectedSocketId = (socketId: InitialState["selectedSocketId"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_SELECTED_SOCKETID,
        payload: socketId
    })
}

export const updateMaster = (newMaster: InitialState["master"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_MASTER,
        payload: newMaster
    })
}

export const updateServer = (newServer: InitialState["webServerSocketURL"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_SOCKET_SERVER,
        payload: newServer
    })
}

export const updateServerPort = (newPort: InitialState["webServerSocketPort"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_SOCKET_SERVER_PORT,
        payload: newPort
    })
}

export const updateServerPassword = (password: InitialState["webServerSocketPassword"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_SOCKET_SERVER_PASSWORD,
        payload: password
    })
}

export const setLoged = (loged: InitialState["loged"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_LOGED,
        payload: loged
    })
}

export const setOnlineServer = (onlineServer: InitialState["connected"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.ONLINE_SERVER,
        payload: onlineServer
    })
}

export const updateBotServer = (newBotServer: InitialState["serverBots"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_BOT_SERVER,
        payload: newBotServer
    })
}
