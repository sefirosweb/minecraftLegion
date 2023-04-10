import { adminPassword, debug, listenPort } from "@/config";
import { Socket } from 'socket.io'
import { BotsConnected } from "./types/index";
import { defaultConfig } from "@/types/types";
import { sessionMiddleware } from '@/app'
import { NextFunction, Request, Response } from 'express';
import { httServer, io } from './socket.io/server';

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

  io.use((socket, next) => {
    sessionMiddleware(socket.request as Request, {} as Response, next as NextFunction);
  });

  io.use((socket, next) => {
    const logedIn = socket.request.session.logedIn;
    if (logedIn) {
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  });

  io.on("connection", (socket) => {
    const sessionId = socket.request.session.id;
    socket.join(sessionId);

    console.log(`New client connected => ${socket.id}`);

    socket.on("disconnect", () => {
      console.log("Client disconnected");

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

    // When bot logins
    socket.on("login", (password) => {
      if (password === adminPassword) {
        console.log(`User loged correctly => ${socket.id}`);
        socket.emit("login", { auth: true });
        socket.join("usersLoged");
        usersLoged.push(socket.id);

        sendMastersOnline()
        sendCoreIsConnected()
      } else {
        socket.emit("login", { auth: false });
      }
    });

    // When bot logins
    socket.on("addFriend", (botName) => {
      if (!isLoged()) {
        return;
      }

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

    socket.on('isCore', () => {

      if (!isLoged()) {
        return;
      }

      usersCoreLogged.push(socket.id);
      sendCoreIsConnected()
    })

    socket.on("getBotsOnline", () => {
      if (!isLoged()) {
        return;
      }
      socket.emit("botsOnline", botsConnected);
    });

    socket.on("botStatus", (data) => {
      if (!isLoged()) {
        return;
      }
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

    socket.on("botConnect", (message) => {
      if (!isLoged()) {
        return;
      }
      io.to("usersLoged").emit("botConnect", message);
    });

    // Reciving logs
    socket.on("logs", (data) => {
      if (!isLoged()) {
        return;
      }
      const find = findBotSocket(socket);
      if (find) {
        sendLogs(data, find.name, socket.id);
      }
    });

    // Receiving chatMessage
    socket.on("sendAction", (data) => {
      if (!isLoged()) {
        return;
      }
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

    const isLoged = () => {
      return usersLoged.find((userId) => userId === socket.id);
    }

    const sendCoreIsConnected = () => {
      io.to("usersLoged").emit("coreConnected", usersCoreLogged.length > 0);
    }

    const sendMastersOnline = () => {
      io.to("usersLoged").emit("mastersOnline", masters);
    }

  });

  function sendLogs(data: string, botName = "", socketId = "") {
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

  function findBotSocket(socket: Socket) {
    const bot = botsConnected.find(
      (botConection) => botConection.socketId === socket.id
    );
    if (bot === undefined) {
      return false;
    } else {
      return bot;
    }
  }

  httServer.listen(listenPort, () =>
    console.log(`Listening on port ${listenPort}`)
  );
};
