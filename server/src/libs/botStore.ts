import { Socket } from "socket.io";
import { socketVariables } from "@/libs/socketVariables";

export const findBotBySocketId = (socketId: string) => {
    return socketVariables.botsConnected.find(
        (botConection) => botConection.socketId === socketId
    );
}

export const findBotBySocket = (socket: Socket) => {
    return findBotBySocketId(socket.id)
}

export const removeBotSocket = (socket: Socket) => {
    const bot = findBotBySocket(socket)

    if (bot === undefined) {
        return;
    }

    socketVariables.botsConnected.splice(socketVariables.botsConnected.indexOf(bot), 1);
    return bot
}