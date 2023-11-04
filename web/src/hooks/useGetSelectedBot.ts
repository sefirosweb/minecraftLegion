import { State } from "@/state";
import { Bot } from "@/types";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router";

export const useGetSelectedBot = () => {
    const { selectedSocketId } = useParams()
    const [selectedBot, setSelectedBot] = useState<Bot | undefined>()
    const botState = useSelector((state: State) => state.botsReducer);
    const { botsOnline } = botState

    useEffect(() => {
        if (!selectedSocketId) {
            setSelectedBot(undefined)
            return
        }

        const bot = botsOnline.find((e) => e.socketId === selectedSocketId)
        setSelectedBot(bot)

    }, [selectedSocketId, botsOnline, setSelectedBot])

    return selectedBot
}