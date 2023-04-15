import { listenPort } from "@/config";
import { Socket } from 'socket.io'
import { BotsConnected, Config } from "@/types/index";
import { defaultConfig } from "@/types/types";
import { httpServer, io } from '@/server';
import path from 'path'
import fs from 'fs'
import { getCurrentDate } from "./libs/currentDate";

export type SocketProps = {
  io: typeof io
  botsConnected: Array<BotsConnected>
  defaultConfig: Config
  sendLogs: (data: string, botName: string, socketId: string) => void
  usersCoreLogged: Array<string>
  masters: Array<{ name: string }>
  sendCoreIsConnected: () => void
  findBotSocket: (socket: Socket) => BotsConnected | undefined
  sendMastersOnline: () => void
  chests: any
  setChests: (chests: any) => void
  portals: any
  setPortals: (portals: any) => void
}

export default () => {
  const masters: Array<{ name: string }> = [];
  const usersLoged: Array<string> = [];
  const usersCoreLogged: Array<string> = [];

  io.on("connection", async (socket) => {
    const sessionId = socket.request.session.id;
    console.log(`New client connected => ${socket.id}`);
    socket.join(sessionId);
    usersLoged.push(socket.id);
    socket.join("usersLoged");
    // sendMastersOnline
    // sendCoreIsConnected()

    const sendLogs = (data: string, botName = "", socketId = "") => {
      const time = getCurrentDate()

      const message = {
        message: data,
        time,
        socketId,
        botName,
      };

      io.to("usersLoged").emit("logs", message);
    }

    const sendCoreIsConnected = () => {
      console.log('sending core')
      io.to("usersLoged").emit("coreConnected", usersCoreLogged.length > 0);
    }

    const findBotSocket = (socket: Socket) => {
      const bot = socketVariables.botsConnected.find(
        (botConection) => botConection.socketId === socket.id
      );

      return bot
    }


    const sendMastersOnline = () => {
      io.to("usersLoged").emit("mastersOnline", masters);
    }

    const setChests = (chests: any) => {
      socketVariables.chests = chests
    }

    const setPortals = (portals: any) => {
      socketVariables.portals = portals
    }

    const socketVariables: SocketProps = {
      masters,
      botsConnected: [],
      defaultConfig,
      sendLogs,
      io,
      usersCoreLogged,
      sendCoreIsConnected,
      findBotSocket,
      sendMastersOnline,
      chests: {},
      setChests,
      portals: {
        overworld_to_the_end: [],
        overworld_to_the_nether: [],
        the_end_to_overworld: [],
        the_nether_to_overworld: []
      },
      setPortals
    }

    const eventosDir = path.join(__dirname, 'socketEvents');
    for (const file of fs.readdirSync(eventosDir)) {
      const evento = await import(path.join(eventosDir, file));
      evento.default(socket, socketVariables);
    }


    socket.on("disconnect", () => {
      console.log(`Client disconnected => ${socket.id}`);

      const userLogedIdx = usersLoged.indexOf(socket.id);
      if (userLogedIdx >= 0) {
        usersLoged.splice(userLogedIdx, 1);
      }

      const usersCoreLoggedIdx = usersCoreLogged.indexOf(socket.id);
      if (usersCoreLoggedIdx >= 0) {
        usersCoreLogged.splice(usersCoreLoggedIdx, 1);
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

      io.to("usersLoged").emit("botsOnline", socketVariables.botsConnected);
      sendLogs("Disconnected", botDisconnected.name, socket.id);
    });


  });

  httpServer.listen(listenPort, () =>
    console.log(`Listening on port ${listenPort}`)
  );
};
