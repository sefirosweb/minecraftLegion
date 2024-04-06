import { botType } from "base-types";
import { startBot } from "@/startBot";
import { connectCore } from "@/modules";
import { botsToStart as botsToStartEnv } from "@/config";

const index = () => {
  connectCore()

  const botsToStart: botType[] = [];

  if (botsToStartEnv) {
    const botsToStartEnvArray = botsToStartEnv.split(',');
    botsToStartEnvArray.forEach((bot) => {
      botsToStart.push({ username: bot });
    });
  }

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
};


index()