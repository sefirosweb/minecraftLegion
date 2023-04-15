import { socketVariables } from "@/libs/socketVariables";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { botsConnected } = socketVariables

    socket.on("getBotsOnline", () => {
        socket.emit("botsOnline", botsConnected);
    });

}