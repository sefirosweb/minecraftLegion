import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { usersCoreLogged, sendCoreIsConnected } = props

    socket.on('isCore', () => {
        usersCoreLogged.push(socket.id);
        sendCoreIsConnected()
    })

}