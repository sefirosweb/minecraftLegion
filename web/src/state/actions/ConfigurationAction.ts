import { ConfigurationType } from "../action-types";
import { InitialState } from "../reducers/configurationReducer";

interface OnlineServerAction {
    type: ConfigurationType.ONLINE_SERVER,
    payload: InitialState["connected"]
}

interface SetSocketAction {
    type: ConfigurationType.SET_SOCKET,
    payload: InitialState["socket"]
}

interface SetMasterAction {
    type: ConfigurationType.SET_MASTER,
    payload: InitialState["master"]
}

interface SetSocketServerAction {
    type: ConfigurationType.SET_SOCKET_SERVER,
    payload: InitialState["webServerSocketURL"]
}

interface SetSocketServerPortAction {
    type: ConfigurationType.SET_SOCKET_SERVER_PORT,
    payload: InitialState["webServerSocketPort"]
}

interface SetLogedAction {
    type: ConfigurationType.SET_LOGED,
    payload: InitialState["loged"]
}

interface SetBotServerAction {
    type: ConfigurationType.SET_BOT_SERVER,
    payload: InitialState["serverBots"]
}

export type ConfiguracionAction =
    OnlineServerAction |
    SetSocketAction |
    SetMasterAction |
    SetSocketServerAction |
    SetSocketServerPortAction |
    SetLogedAction |
    SetBotServerAction
