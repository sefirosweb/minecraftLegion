import { socketVariables } from "@/libs/socketVariables";
import { sendLogs } from "@/socketEmit/sendLogs";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { findBotSocket } = socketVariables

    socket.on("logs", (data) => {
        const find = findBotSocket(socket);
        if (find) {
            sendLogs(data, find.name, socket.id);
        }
    });
}