import { State } from "@/state";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";

const useGetSelectedBotSocket = () => {
    const [selectedBotSocket, setSelectedBotSocket] = useState<string | undefined>(undefined)

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { selectedSocketId } = configurationState

    useEffect(() => {
        setSelectedBotSocket(selectedSocketId)
    }, [selectedSocketId, setSelectedBotSocket])

    return selectedBotSocket
}

export default useGetSelectedBotSocket