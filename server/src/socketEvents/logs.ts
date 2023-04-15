import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { sendLogs, findBotSocket } = props

    socket.on("logs", (data) => {
        const find = findBotSocket(socket);
        if (find) {
            sendLogs(data, find.name, socket.id);
        }
    });
}