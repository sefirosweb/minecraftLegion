import { sendBotsOnline } from "@/socketEmit/sendBotsOnline";
import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { sendMastersOnline } from "@/socketEmit/sendMastersOnline";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('isWeb', () => {
        socket.join("web");
        sendBotsOnline()
        sendMastersOnline()
        sendCoreIsConnected()
    })
}