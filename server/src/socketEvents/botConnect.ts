import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { io } = props

    socket.on("botConnect", (message) => {
        console.log('Send start bot ', message)
        io.to("usersLoged").emit("botConnect", message);
    });
}