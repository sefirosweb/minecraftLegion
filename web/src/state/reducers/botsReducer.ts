import { BotsType } from "../action-types";
import { BotsAction } from "../actions/";

export type InitialState = {
  logs: Array<{
    botName: string
    message: string
    socketId: string
    time: string
  }>
  botsOnline: Array<Bot>,
  masters: Array<{ name: string }>,
  chests: Record<string, any>,
  portals: Record<string, any>,
}

const INITIAL_STATE: InitialState = {
  logs: [],
  botsOnline: [],
  masters: [],
  chests: {},
  portals: {},
}

const reducer = (state = INITIAL_STATE, action: BotsAction) => {
  switch (action.type) {
    case BotsType.SET_BOTS:
      return {
        ...state,
        botsOnline: action.payload
      }

    case BotsType.SET_LOGS:
      return {
        ...state,
        logs: action.payload
      }

    case BotsType.SET_MASTERS:
      return {
        ...state,
        masters: action.payload
      }

    case BotsType.SET_CHESTS:
      return {
        ...state,
        chests: action.payload
      }

    case BotsType.SET_PORTALS:
      return {
        ...state,
        portals: action.payload
      }

    default: return state
  }
};

export default reducer