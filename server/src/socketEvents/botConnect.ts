import { sendBotConnect } from "@/socketEmit/sendBotConnect";
import { Socket } from "socket.io";

export type BotCredentials = {
    botName: string,
    botPassword: string
}

export default (socket: Socket) => {
    socket.on("botConnect", (message: BotCredentials) => {
        sendBotConnect(message)
    });
}