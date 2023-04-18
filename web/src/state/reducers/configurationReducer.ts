import { ConfigurationType } from "../action-types";
import { ConfiguracionAction } from "../actions/";
import { Socket } from "socket.io-client";

export type InitialState = {
  socket: Socket | null,
  master: string,
  loged: boolean
}

const INITIAL_STATE: InitialState = {
  socket: null,
  master: localStorage.getItem('master') ?? 'PlayerName',
  loged: localStorage.getItem('logedIn') === 'true'
}

const reducer = (state = INITIAL_STATE, action: ConfiguracionAction) => {
  switch (action.type) {

    case ConfigurationType.SET_SOCKET:
      return {
        ...state,
        socket: action.payload
      }

    case ConfigurationType.SET_MASTER:
      localStorage.setItem('master', action.payload);
      return {
        ...state,
        master: action.payload
      }

    case ConfigurationType.SET_LOGED:
      localStorage.setItem('logedIn', action.payload ? 'true' : 'false');
      return {
        ...state,
        loged: action.payload
      }

    default: return state
  }
};

export default reducer