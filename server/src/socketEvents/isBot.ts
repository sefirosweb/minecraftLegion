import { Socket } from "socket.io";
import { sendBotsOnline } from "@/socketEmit/sendBotsOnline";
import { sendLogs } from "@/socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";

export default (socket: Socket) => {
    socket.on('isBot', (botName: string) => {
        const { botsConnected, defaultConfig } = socketVariables
        socket.join("bot");

        const find = botsConnected.find(
            (botConection) => botConection.name === botName
        );

        if (find === undefined) {
            botsConnected.push({
                socketId: socket.id,
                name: botName,
                health: 20,
                food: 20,
                combat: false,
                stateMachinePort: undefined,
                inventoryPort: undefined,
                viewerPort: undefined,
                events: [],
                config: defaultConfig
            });
        }

        sendBotsOnline()
        sendLogs("Login", botName, socket.id);
    })
}