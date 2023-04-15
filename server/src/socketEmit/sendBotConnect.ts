import { io } from "@/server";
import { BotCredentials } from "@/socketEvents/botConnect";

export const sendBotConnect = (botCredentials: BotCredentials) => {
    io.to("core").emit("botConnect", botCredentials);
}