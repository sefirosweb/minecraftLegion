import { socketVariables } from "@/libs/socketVariables";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { io } = socketVariables

    socket.on("botConnect", (message) => {
        console.log('Send start bot ', message)
        io.to("usersLoged").emit("botConnect", message);
    });
}