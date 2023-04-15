import { socketVariables } from "@/libs/socketVariables";
import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { usersCoreLogged } = socketVariables

    socket.on('isCore', () => {
        usersCoreLogged.push(socket.id);
        sendCoreIsConnected()
    })

}