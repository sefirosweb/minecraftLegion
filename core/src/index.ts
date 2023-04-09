import { botSocket, botType, socketAuth } from "base-types";
import Config from '@/config'
import io from 'socket.io-client'
import path from 'path'
import { exec } from "child_process"

const start_bot = () => {
  const { autoRestart, environment } = Config

  function startBot(botName: string, password?: string) {
    const command = environment === 'stage' ? `npm run ts ${botName} ${password ?? ''}` : `node ${path.join(__dirname, 'start_bot.js')} ${botName} ${password ?? ''}`

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log(`Bot broken: ${botName}`);
        console.log(`Error: ${err}`);

        if (autoRestart) {
          setTimeout(() => {
            startBot(botName, password);
          }, 1000);
        }
        return;
      }

      if (stdout) {
        console.log(`Stdout: ${stdout}`);
      }

      if (stderr) {
        console.log(`Stderr: ${stderr}`);
      }
    })
  }

  const botsToStart: botType[] = [
    // { username: 'Sephi' }
    // { username: 'Types' },
    // { username: 'Type' },

    // { username: "MinerY1" },
    // { username: "MinerY2" },
    // { username: "MinerY3" },
    // { username: "MinerY4" },
    // { username: "MinerY5" },
    // { username: "MinerY6" },
    // { username: "MinerY7" },
    // { username: "MinerY8" },

    // { username: "MinerX+" },
    // { username: "MinerX-" },
    // { username: "MinerZ+" },
    // { username: "MinerZ-" },
    // { username: 'Breeder' },
    // { username: 'Guard1' },
    // { username: 'Guard2' },
    // { username: 'Guard3' },
    // { username: 'Guard1' }
    // { username: 'Guard2' },
    // { username: 'Guard3' }
  ];

  let i = 0;
  function runNextBot() {
    const botToStart = botsToStart[i];
    i++;
    if (i <= botsToStart.length) {
      setTimeout(() => {
        startBot(botToStart.username);
        runNextBot();
      }, 7000);
    }
  }

  runNextBot();

  // Master websocket for load bots
  const { webServer, webServerPort, webServerPassword } = Config;
  const socket = io(webServer + ":" + webServerPort);
  let loged = false;

  socket.on("connect", () => {
    console.log("Connected to webserver");
    socket.emit("botMaster", "on");
    socket.emit("login", webServerPassword);
  });

  socket.on("login", (authenticate: socketAuth) => {
    if (authenticate.auth) {
      loged = true;
    } else {
      loged = false;
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnected from webserver");
  });

  socket.on("botConnect", (data: botSocket) => {
    if (!loged) {
      return;
    }
    console.log(`Starting bot ${data.botName}`);
    startBot(data.botName, data.botPassword);
  });
};


start_bot()