
import { listenPort } from "@/config";
import { httpServer, io } from '@/server';
import { sendLogs } from "./socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";
import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { sendBotsOnline } from './socketEmit/sendBotsOnline';
import { loadSocketEvents } from "./loadSocketEvents";
import { removeBotSocket } from "./libs/botStore";

export default () => {
  io.on("connection", async (socket) => {
    const sessionId = socket.request.session.id;
    socket.join(sessionId);
    loadSocketEvents(socket)

    socket.on("disconnect", () => {
      sendCoreIsConnected()

      console.log(`Client disconnected => ${socket.id}`);
      const bot = removeBotSocket(socket)
      if (!bot) return

      sendBotsOnline()
      sendLogs("Disconnected", bot.name, socket.id);
    });

  });

  httpServer.listen(listenPort, () =>
    console.log(`Listening on port ${listenPort}`)
  );
};
