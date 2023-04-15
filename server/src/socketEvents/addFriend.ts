import { socketVariables } from "@/libs/socketVariables";
import { sendBotsOnline } from "@/socketEmit/sendBotsOnline";
import { sendLogs } from "@/socketEmit/sendLogs";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { botsConnected, defaultConfig } = socketVariables

    socket.on("addFriend", (botName: string) => {
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
    });
}