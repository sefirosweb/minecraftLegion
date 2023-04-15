import { io } from "@/server";

export const sendCoreIsConnected = () => {
    const room = io.sockets.adapter.rooms.get('core')
    const numClients = room ? room.size : 0;
    console.log({ numClients })
    io.to("web").emit("coreConnected", numClients > 0);
}