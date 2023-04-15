import { io } from "@/server";
import { socketVariables } from '@/libs/socketVariables'

export const sendBotsOnline = () => {
    io.to("web").emit("botsOnline", socketVariables.botsConnected);
}