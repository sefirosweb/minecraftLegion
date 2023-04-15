import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { botsConnected } = props

    socket.on("getBotsOnline", () => {
        socket.emit("botsOnline", botsConnected);
    });

}