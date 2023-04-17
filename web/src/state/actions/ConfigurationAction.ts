import { ConfigurationType } from "../action-types";
import { InitialState } from "../reducers/configurationReducer";
interface SetSocketAction {
    type: ConfigurationType.SET_SOCKET,
    payload: InitialState["socket"]
}

interface SetMasterAction {
    type: ConfigurationType.SET_MASTER,
    payload: InitialState["master"]
}


interface SetLogedAction {
    type: ConfigurationType.SET_LOGED,
    payload: InitialState["loged"]
}

export type ConfiguracionAction =
    SetSocketAction |
    SetMasterAction |
    SetLogedAction
