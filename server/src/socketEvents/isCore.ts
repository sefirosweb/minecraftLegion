import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('isCore', () => {
        socket.join("core");
        sendCoreIsConnected()
    })

}