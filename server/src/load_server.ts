import { debug, listenPort } from "@/config";
import { Socket } from 'socket.io'
import { BotsConnected, Config } from "@/types/index";
import { defaultConfig } from "@/types/types";
import { httpServer, io } from '@/server';
import path from 'path'
import fs from 'fs'

export type SocketProps = {
  io: typeof io
  botsConnected: Array<BotsConnected>
  defaultConfig: Config
  sendLogs: (data: string, botName: string, socketId: string) => void
  usersCoreLogged: Array<string>
  sendCoreIsConnected: () => void
  findBotSocket: (socket: Socket) => BotsConnected | undefined
}

export default () => {
  const botsConnected: Array<BotsConnected> = [];
  const masters: Array<{ name: string }> = [];
  const usersLoged: Array<string> = [];
  const usersCoreLogged: Array<string> = [];
  let chests = {};


  let portals = {
    overworld_to_the_end: [],
    overworld_to_the_nether: [],
    the_end_to_overworld: [],
    the_nether_to_overworld: []
  };



  io.on("connection", async (socket) => {
    const sessionId = socket.request.session.id;
    console.log(`New client connected => ${socket.id}`);
    socket.join(sessionId);
    usersLoged.push(socket.id);
    socket.join("usersLoged");
    // sendMastersOnline
    // sendCoreIsConnected()

    const sendLogs = (data: string, botName = "", socketId = "") => {
      const date = new Date();
      const time =
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + (date.getMinutes() + 1)).slice(-2) +
        ":" +
        ("0" + (date.getSeconds() + 1)).slice(-2);

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
      const bot = botsConnected.find(
        (botConection) => botConection.socketId === socket.id
      );

      return bot
    }

    const socketVariables: SocketProps = {
      botsConnected,
      defaultConfig,
      sendLogs,
      io,
      usersCoreLogged,
      sendCoreIsConnected,
      findBotSocket
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

      const botDisconnected = botsConnected.find(
        (botConection) => botConection.socketId === socket.id
      );
      // If connection is not bot o continue
      if (botDisconnected === undefined) {
        return;
      }
      botsConnected.splice(botsConnected.indexOf(botDisconnected), 1);

      io.to("usersLoged").emit("botsOnline", botsConnected);
      sendLogs("Disconnected", botDisconnected.name, socket.id);
    });

    socket.on("botStatus", (data) => {
      const botIndex = botsConnected.findIndex((e) => {
        return e.socketId === socket.id;
      });
      if (botIndex >= 0) {
        const message = {
          type: data.type,
          value: data.value,
          socketId: socket.id,
        };

        io.to("usersLoged").emit("botStatus", message);
        // @ts-ignore via web socket can update any data
        botsConnected[botIndex][message.type] = message.value;
      }
    });

    // Reciving logs


    // Receiving chatMessage
    socket.on("sendAction", (data) => {
      let index;

      if (debug) console.log(data);

      // console.log(data)
      switch (data.action) {
        case "action":
          io.to(data.socketId).emit("action", data.toBotData);
          break;
        case "startStateMachine":
          io.to(data.socketId).emit("action", {
            type: "startStateMachine",
            value: data.value,
          });
          index = botsConnected.findIndex((e) => {
            return e.socketId === data.socketId;
          });
          if (index >= 0) {
            botsConnected[index].stateMachinePort = data.value.port;
            io.to("usersLoged").emit("botsOnline", botsConnected);
          }
          break;
        case "startInventory":
          io.to(data.socketId).emit("action", {
            type: "startInventory",
            value: data.value,
          });
          index = botsConnected.findIndex((e) => {
            return e.socketId === data.socketId;
          });
          if (index >= 0) {
            botsConnected[index].inventoryPort = data.value.port;
            io.to("usersLoged").emit("botsOnline", botsConnected);
          }
          break;
        case "startViewer":
          io.to(data.socketId).emit("action", {
            type: "startViewer",
            value: data.value,
          });
          index = botsConnected.findIndex((e) => {
            return e.socketId === data.socketId;
          });
          if (index >= 0) {
            botsConnected[index].viewerPort = data.value.port;
            io.to("usersLoged").emit("botsOnline", botsConnected);
          }
          break;
        case "sendDisconnect":
          io.to(data.socketId).emit("sendDisconnect", data.value);
          break;
        case "getConfig":
          io.to(data.socketId).emit("getConfig", socket.id);
          break;
        case "sendConfig":
          data.value.socketId = socket.id;
          io.to("usersLoged").emit("sendConfig", data.value);
          break;
        case "changeConfig":
          data.value.fromSocketId = socket.id;
          io.to(data.socketId).emit("changeConfig", data.value);
          break;
        case "addMaster":
          if (data.value === undefined) {
            return;
          }
          data.value = data.value.trim();

          const masterToAddIndex = masters.findIndex((e) => {
            return e.name === data.value;
          });
          if (masterToAddIndex < 0 && data.value !== "") {
            masters.push({
              name: data.value,
            });
          }

          sendMastersOnline()
          break;
        case "removeMaster":
          if (data.value === undefined) {
            return;
          }
          data.value = data.value.trim();

          const masterToRemoveIndex = masters.findIndex((e) => {
            return e.name === data.value;
          });
          if (masterToRemoveIndex >= 0) {
            masters.splice(masterToRemoveIndex, 1);
          }

          sendMastersOnline()
          break;
        case "setChests":
          if (data.value === undefined) {
            return;
          }
          chests = data.value;
          io.to("usersLoged").emit("action", {
            type: "getChests",
            value: chests,
          });
          break;
        case "getChests":
          socket.emit("action", { type: "getChests", value: chests });
          break;
        case "setPortals":
          if (data.value === undefined) {
            return;
          }
          portals = data.value;
          io.to("usersLoged").emit("action", {
            type: "getPortals",
            value: portals,
          });
          break;
        case "getPortals":
          socket.emit("action", { type: "getPortals", value: portals });
          break;
      }
    });



    const sendMastersOnline = () => {
      io.to("usersLoged").emit("mastersOnline", masters);
    }

  });





  httpServer.listen(listenPort, () =>
    console.log(`Listening on port ${listenPort}`)
  );
};
