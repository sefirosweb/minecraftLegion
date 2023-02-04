import { combineReducers } from "redux";
import configurationReducer from "./configurationReducer";
import botsReducer from "./botsReducer";

const reducers = combineReducers({
    botsReducer, configurationReducer,
});

export default reducers

export type State = ReturnType<typeof reducers>