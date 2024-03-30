import { Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('sendDirectMessage', (targetSocketId, message) => {
        socket.to(targetSocketId).emit('receiveDirectMessage', message);
    });
}