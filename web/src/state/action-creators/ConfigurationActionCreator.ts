
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

export const updateMaster = (newMaster: InitialState["master"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_MASTER,
        payload: newMaster
    })
}

export const setLoged = (loged: InitialState["loged"]) => (dispatch: Dispatch<ConfiguracionAction>) => {
    dispatch({
        type: ConfigurationType.SET_LOGED,
        payload: loged
    })
}