import { io } from "@/server";
import { socketVariables } from '@/libs/socketVariables'

export const sendPortals = () => {
    io
        .to("web")
        .to("bot")
        .emit("action", {
            type: "getPortals",
            value: socketVariables.portals,
        });
}