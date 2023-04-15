import { getCurrentDate } from "@/libs/currentDate";
import { io } from "@/server";

export const sendLogs = (message: string, botName = "", socketId = "") => {
    const time = getCurrentDate()
    const data = { message, time, socketId, botName, };
    io.to("web").emit("logs", data);
}