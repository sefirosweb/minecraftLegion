
import { listenPort } from "@/config";
import { httpServer, io } from '@/server';
import { sendLogs } from "./socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";
import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { sendBotsOnline } from './socketEmit/sendBotsOnline';
import { loadSocketEvents } from "./loadSocketEvents";

export default () => {
  io.on("connection", async (socket) => {
    const sessionId = socket.request.session.id;
    socket.join(sessionId);
    loadSocketEvents(socket)

    socket.on("disconnect", () => {
      console.log(`Client disconnected => ${socket.id}`);

      sendCoreIsConnected()

      const botDisconnected = socketVariables.botsConnected.find(
        (botConection) => botConection.socketId === socket.id
      );
      // If connection is not bot o continue
      if (botDisconnected === undefined) {
        return;
      }

      socketVariables.botsConnected.splice(socketVariables.botsConnected.indexOf(botDisconnected), 1);

      sendBotsOnline()
      sendLogs("Disconnected", botDisconnected.name, socket.id);
    });

  });

  httpServer.listen(listenPort, () =>
    console.log(`Listening on port ${listenPort}`)
  );
};
