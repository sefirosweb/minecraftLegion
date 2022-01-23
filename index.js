require("module-alias/register");
const fs = require("fs");

const filePath = "./config.js";

fs.access(filePath, fs.F_OK, (err) => {
  if (err) {
    fs.copyFile("./config_example.js", filePath, (err) => {
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
  const path = require("path");

  function startBot(botName, password) {
    const command = "node " + path.join(__dirname, "start_bot") + " " + botName;
    cp.exec(command, (err, stdout, stderr) => {
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

  const botsToStart = [
    // { username: 'Sephi' }
    { username: 'Sorter' },
    { username: "MinerY1" },
    { username: "MinerY2" },
    { username: "MinerY3" },
    { username: "MinerY4" },
    { username: "MinerX+" },
    { username: "MinerX-" },
    { username: "MinerZ+" },
    { username: "MinerZ-" },
    { username: 'Breeder' },
    { username: 'Guard1' },
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
      }, 3000);
    }
  }

  runNextBot();

  // Master websocket for load bots
  const { webServer, webServerPort, webServerPassword } = require("@config");
  const io = require("socket.io-client");
  const { exit } = require("process");
  const socket = io(webServer + ":" + webServerPort);
  let loged = false;

  socket.on("connect", () => {
    console.log("Connected to webserver");
    socket.emit("botMaster", "on");
    socket.emit("login", webServerPassword);
  });

  socket.on("login", (authenticate) => {
    if (authenticate.auth) {
      loged = true;
    } else {
      loged = false;
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnected from webserver");
  });

  socket.on("botConnect", (data) => {
    if (!loged) {
      return;
    }
    console.log(`Starting bot ${data.botName}`);
    startBot(data.botName, data.botPassword);
  });
};
