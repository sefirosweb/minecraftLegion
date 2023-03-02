import config from "@/config";
const { server, port, customStart } = config

import { createNewBot, Props } from "./createNewBot"

const botConfig: Props = {
    server,
    port,
    customStart,
    botPassword: process.argv[3],
    botName: process.argv[2]
}

createNewBot(botConfig)