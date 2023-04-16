import { State } from "@/state";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
const useGetSelectedBot = (selectedSocketId?: string) => {
    const [selectedBot, setSelectedBot] = useState<Bot | undefined>(undefined)
    const botState = useSelector((state: State) => state.botsReducer);
    const { botsOnline } = botState

    useEffect(() => {
        if (!selectedSocketId) {
            setSelectedBot(undefined)
            return
        }

        const bot = botsOnline.find((e) => { return e.socketId === selectedSocketId })
        setSelectedBot(bot)

    }, [selectedSocketId, botsOnline, setSelectedBot])

    return selectedBot
}

export default useGetSelectedBot