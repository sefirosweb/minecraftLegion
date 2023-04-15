
import { listenPort } from "@/config";
import { httpServer, io } from '@/server';
import { sendLogs } from "./socketEmit/sendLogs";
import { socketVariables } from "@/libs/socketVariables";
import { sendCoreIsConnected } from "@/socketEmit/sendCoreIsConnected";
import { sendMastersOnline } from '@/socketEmit/sendMastersOnline';
import { sendBotsOnline } from './socketEmit/sendBotsOnline';
import { loadSocketEvents } from "./loadSocketEvents";

export default () => {
  const usersLoged: Array<string> = [];

  io.on("connection", async (socket) => {
    const sessionId = socket.request.session.id;
    console.log(`New client connected => ${socket.id}`);
    socket.join(sessionId);
    socket.join("usersLoged");
    usersLoged.push(socket.id);


    loadSocketEvents(socket)

    sendBotsOnline()
    sendMastersOnline()
    sendCoreIsConnected()

    socket.on("disconnect", () => {
      console.log(`Client disconnected => ${socket.id}`);

      const userLogedIdx = usersLoged.indexOf(socket.id);
      if (userLogedIdx >= 0) {
        usersLoged.splice(userLogedIdx, 1);
      }

      const usersCoreLoggedIdx = socketVariables.usersCoreLogged.indexOf(socket.id);
      if (usersCoreLoggedIdx >= 0) {
        socketVariables.usersCoreLogged.splice(usersCoreLoggedIdx, 1);
      }

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
