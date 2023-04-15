import { socketVariables } from "@/libs/socketVariables";
import { sendLogs } from "@/socketEmit/sendLogs";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { findBotBySocket } = socketVariables

    socket.on("logs", (data) => {
        const find = findBotBySocket(socket);
        if (find) {
            sendLogs(data, find.name, socket.id);
        }
    });
}