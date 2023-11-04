import { findBotBySocket } from "@/libs/botStore";
import { io } from "@/server";
import { BotsConnected } from "@/types";
import { Socket } from "socket.io";

type SocketMessage = {
    type: keyof BotsConnected
    value: number
}

export default (socket: Socket) => {
    socket.on("botStatus", (data: SocketMessage) => {
        const bot = findBotBySocket(socket)
        if (!bot) return

        const message = {
            type: data.type,
            value: data.value,
            socketId: socket.id,
        };

        io.to("web").emit("botStatus", message);

        if (data.type === 'health') {
            bot.health = message.value;
        }

        if (data.type === 'food') {
            bot.food = message.value;
        }
    });
}