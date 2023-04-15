import fs from 'fs'
import path from 'path'
import { Socket } from 'socket.io';

export const loadSocketEvents = async (socket: Socket) => {
    const eventosDir = path.join(__dirname, 'socketEvents');
    for (const file of fs.readdirSync(eventosDir)) {
        const evento = await import(path.join(eventosDir, file));
        evento.default(socket);
    }

}