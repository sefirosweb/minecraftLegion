import { State, actionCreators } from "@/state";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";


export const useSetSelectedSocket = () => {
    const dispatch = useDispatch();

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { selectedSocketId } = configurationState

    const botsState = useSelector((state: State) => state.botsReducer);
    const { botsOnline } = botsState

    const { setSelectedSocketId } = bindActionCreators(actionCreators, dispatch);


    useEffect(() => {
        if (!selectedSocketId) return

        const bot = botsOnline.find((e) => { return e.socketId === selectedSocketId })
        if (!bot) {
            setSelectedSocketId(undefined)
        }

    }, [botsOnline, selectedSocketId, setSelectedSocketId])
}