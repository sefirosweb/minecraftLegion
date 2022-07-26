require("module-alias/register");
import fs from "fs";
import path from "path";

type botType = {
  username: string
}

const filePath = path.join(__dirname, "config.js")

fs.access(filePath, 0, (err) => {
  if (err) {
    fs.copyFile(path.join(__dirname, "config_example.js"), filePath, (err) => {
      if (err) throw err;
      start_bot();
      return;
    });
  }

  start_bot();
});

const start_bot = () => {
  const { autoRestart } = require("@config");
  const cp = require("child_process");

  function startBot(botName: string, password?: string) {
    const command = `npm run ts ${botName} ${password ?? ''}`;
    cp.exec(command, (err: string, stdout: string, stderr: string) => {
      if (err) {
        console.log(`Error: ${err}`);
        console.log(`Bot broken: ${botName}`);
        return;
      }

      if (stdout) {
        console.log(`Stdout: ${stdout}`);
        if (autoRestart) {
          startBot(botName, password);
        }
      }

      if (stderr) {
        console.log(`Stderr: ${stderr}`);
      }
    });
  }

  const botsToStart: botType[] = [
    // { username: 'Sephi' }
    { username: 'Types' },
    { username: 'Type' },

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
  const { webServer, webServerPort, webServerPassword } = require("@config");
  const io = require("socket.io-client");
  const socket = io(webServer + ":" + webServerPort);
  let loged = false;

  socket.on("connect", () => {
    console.log("Connected to webserver");
    socket.emit("botMaster", "on");
    socket.emit("login", webServerPassword);
  });

  type socketAuth = {
    auth: string
  }

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

  type botSocket = {
    botName: string
    botPassword?: string
  }

  socket.on("botConnect", (data: botSocket) => {
    if (!loged) {
      return;
    }
    console.log(`Starting bot ${data.botName}`);
    startBot(data.botName, data.botPassword);
  });
};
