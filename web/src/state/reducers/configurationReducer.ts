import { ConfigurationType } from "../action-types";
import { ConfiguracionAction } from "../actions/";
import Cookies from 'js-cookie' // TODO poner en local storage en vez de js cookie
import { Socket } from "socket.io-client";

export type InitialState = {
  connected: boolean
  webServerSocketURL: string
  webServerSocketPort: number,
  serverBots: string,
  socket: Socket | null,
  master: string,
  loged: boolean
}


const INITIAL_STATE: InitialState = {
  connected: false,
  webServerSocketURL: Cookies.get('webServerSocketURL') ?? 'localhost',
  webServerSocketPort: parseInt(Cookies.get('webServerSocketPort') ?? '4001'),
  serverBots: Cookies.get('serverBots') ?? 'localhost',
  socket: null,
  master: Cookies.get('master') ?? 'PlayerName',
  loged: localStorage.getItem('logedIn') === 'true'

}

const reducer = (state = INITIAL_STATE, action: ConfiguracionAction) => {
  switch (action.type) {
    case ConfigurationType.ONLINE_SERVER:
      return {
        ...state,
        connected: action.payload
      }

    case ConfigurationType.SET_SOCKET:
      return {
        ...state,
        socket: action.payload
      }

    case ConfigurationType.SET_MASTER:
      Cookies.set('master', action.payload)
      return {
        ...state,
        master: action.payload
      }

    case ConfigurationType.SET_SOCKET_SERVER:
      Cookies.set('webServerSocketURL', action.payload)
      return {
        ...state,
        webServerSocketURL: action.payload
      }

    case ConfigurationType.SET_SOCKET_SERVER_PORT:
      Cookies.set('webServerSocketPort', action.payload.toString())
      return {
        ...state,
        webServerSocketPort: action.payload
      }

    case ConfigurationType.SET_LOGED:
      localStorage.setItem('logedIn', action.payload ? 'true' : 'false');
      return {
        ...state,
        loged: action.payload
      }

    case ConfigurationType.SET_BOT_SERVER:
      Cookies.set('serverBots', action.payload)
      return {
        ...state,
        serverBots: action.payload
      }

    default: return state
  }
};

export default reducer