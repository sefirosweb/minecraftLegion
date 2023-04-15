import { socketVariables } from "@/libs/socketVariables";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { io, botsConnected } = socketVariables

    socket.on("botStatus", (data) => {
        const botIndex = botsConnected.findIndex((e) => {
            return e.socketId === socket.id;
        });
        if (botIndex >= 0) {
            const message = {
                type: data.type,
                value: data.value,
                socketId: socket.id,
            };

            io.to("usersLoged").emit("botStatus", message);
            // @ts-ignore via web socket can update any data
            botsConnected[botIndex][message.type] = message.value;
        }
    });
}