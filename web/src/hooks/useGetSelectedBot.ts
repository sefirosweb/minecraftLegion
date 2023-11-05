import { Bot } from "@/types";
import { useEffect, useState } from "react"
import { useParams } from "react-router";
import { useStore } from "./useStore";

export const useGetSelectedBot = () => {
    const { selectedSocketId } = useParams()
    const [selectedBot, setSelectedBot] = useState<Bot | undefined>()
    const botsOnline = useStore((state) => state.botsOnline)

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