import { Socket } from "socket.io";
import { socketVariables } from "@/libs/socketVariables";

export const findBotSocket = (socket: Socket) => {
    const bot = socketVariables.botsConnected.find(
        (botConection) => botConection.socketId === socket.id
    );

    return bot
}