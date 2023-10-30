import useGetSocket from "./useGetSocket"
import { useParams } from "react-router";

export const useSendActionSocket = () => {
    const socket = useGetSocket()
    const { selectedSocketId } = useParams()

    return (action: string, value?: any) => {
        if (!socket || !selectedSocketId) return

        socket.emit("sendAction", {
            action,
            socketId: selectedSocketId,
            value,
        });
    }

}