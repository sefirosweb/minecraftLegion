import { botType } from "base-types";
import { startBot } from "@/startBot";
import { connectCore } from "@/modules/connectSocket";

const index = () => {

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

  connectCore()
};


index()