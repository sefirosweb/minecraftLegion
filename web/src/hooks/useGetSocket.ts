import { State } from "@/state";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { Socket } from "socket.io-client";

const useGetSocket = () => {
    const [currentSocket, setCurrentSocket] = useState<Socket | null>(null)

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { socket } = configurationState

    useEffect(() => {
        setCurrentSocket(socket)
    }, [socket])

    return currentSocket
}

export default useGetSocket