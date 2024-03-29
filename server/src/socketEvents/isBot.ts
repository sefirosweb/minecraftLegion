import { Socket } from "socket.io";
import { sendBotsOnline } from "@/socketEmit/sendBotsOnline";
import { sendLogs } from "@/socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";
import { sendMastersOnline } from "@/socketEmit/sendMastersOnline";
import { Bot } from "@/models/bot";
import { defaultConfig } from "base-types";

export default (socket: Socket) => {
    socket.on('isBot', async (botName: string) => {
        const { botsConnected } = socketVariables
        socket.join("bot");
        const address = socket.handshake.address;

        const find = botsConnected.find(bot => bot.name === botName);

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
                config: defaultConfig,
                address
            });
        }

        const bot = await Bot.findByPk(botName)
        if (!bot) {
            Bot.upsert({
                name: botName,
                config: JSON.stringify(defaultConfig)
            });
        }

        sendMastersOnline()
        sendBotsOnline()
        sendLogs("Login", botName, socket.id);
    })

}
