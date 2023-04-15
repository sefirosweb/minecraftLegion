import { Socket } from "socket.io";
import { sendBotsOnline } from "@/socketEmit/sendBotsOnline";
import { sendLogs } from "@/socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";
import { sendMastersOnline } from "@/socketEmit/sendMastersOnline";
import { Bot } from "@/models/bot";

export default (socket: Socket) => {
    socket.on('isBot', async (botName: string) => {
        const { botsConnected, defaultConfig } = socketVariables
        socket.join("bot");

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
                config: defaultConfig
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
