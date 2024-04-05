import { io } from "@/server";
import { socketVariables } from '@/libs/socketVariables'

export const sendChests = () => {
    io
        .to("web")
        .to("bot")
        .emit("action", {
            type: "getChests",
            value: socketVariables.chests,
        });
}