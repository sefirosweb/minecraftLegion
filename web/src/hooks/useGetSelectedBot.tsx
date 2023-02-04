import { actionCreators, State } from "@/state";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import useGetSelectedBotSocket from './useGetSelectedBotSocket'
const useGetSelectedBot = () => {
    const [selectedBot, setSelectedBot] = useState<Bot | undefined>(undefined)
    const selectedSocketId = useGetSelectedBotSocket()
    const botState = useSelector((state: State) => state.botsReducer);
    const { botsOnline } = botState
    const dispatch = useDispatch();

    useEffect(() => {
        if (!selectedSocketId) {
            setSelectedBot(undefined)
            return
        }

        const bot = botsOnline.find((e) => { return e.socketId === selectedSocketId })
        setSelectedBot(bot)

        if (!bot) {
            const { setSelectedSocketId } = bindActionCreators(actionCreators, dispatch);
            setSelectedSocketId(undefined)
        }

    }, [selectedSocketId, botsOnline, setSelectedBot, dispatch])
    return selectedBot
}

export default useGetSelectedBot