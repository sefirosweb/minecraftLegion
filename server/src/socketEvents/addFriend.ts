import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { botsConnected, defaultConfig, io, sendLogs } = props

    socket.on("addFriend", (botName) => {
        const find = botsConnected.find(
            (botConection) => botConection.name === botName
        );

        if (find === undefined) {
            botsConnected.push({
                // Default Data
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
        io.to("usersLoged").emit("botsOnline", botsConnected);
        sendLogs("Login", botName, socket.id);
    });
}