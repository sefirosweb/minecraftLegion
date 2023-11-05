import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";
import { useStore } from "./useStore";

export const useGetSocket = () => {
    const [currentSocket, setCurrentSocket] = useState<Socket | null>(null)
    const socket = useStore((state) => state.socket)

    useEffect(() => {
        setCurrentSocket(socket)
    }, [socket])

    return currentSocket
}
