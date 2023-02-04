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

interface SetSelectedSocketidAction {
    type: ConfigurationType.SET_SELECTED_SOCKETID,
    payload: InitialState["selectedSocketId"]
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

interface SetSocketServerPasswordAction {
    type: ConfigurationType.SET_SOCKET_SERVER_PASSWORD,
    payload: InitialState["webServerSocketPassword"]
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
    SetSelectedSocketidAction |
    SetMasterAction |
    SetSocketServerAction |
    SetSocketServerPortAction |
    SetSocketServerPasswordAction |
    SetLogedAction |
    SetBotServerAction
