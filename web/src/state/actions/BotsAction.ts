import { BotsType } from "../action-types";
import { InitialState } from "../reducers/botsReducer";

interface SetBotsAction {
    type: BotsType.SET_BOTS,
    payload: InitialState["botsOnline"]
}

interface SetLogsAction {
    type: BotsType.SET_LOGS,
    payload: InitialState["logs"]
}
interface SetMastersAction {
    type: BotsType.SET_MASTERS,
    payload: InitialState["masters"]
}

interface SetChestsAction {
    type: BotsType.SET_CHESTS,
    payload: InitialState["chests"]
}

interface SetPortalsAction {
    type: BotsType.SET_PORTALS,
    payload: InitialState["portals"]
}

export type BotsAction =
    SetBotsAction |
    SetLogsAction |
    SetMastersAction |
    SetChestsAction |
    SetPortalsAction