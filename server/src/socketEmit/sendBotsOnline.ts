import { io } from "@/server";
import { socketVariables } from '@/libs/socketVariables'

export const sendBotsOnline = () => {
    io.to("usersLoged").emit("botsOnline", socketVariables.botsConnected);
}