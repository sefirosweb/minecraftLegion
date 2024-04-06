import { log } from "@/config";
import { socketVariables } from "@/libs/socketVariables";
import { io } from "@/server";
import { sendChests, sendMastersOnline, sendPortals } from "@/socketEmit";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const { masters, chests, setChests, portals, setPortals } = socketVariables

    socket.on("sendAction", (data) => {
        log(data);

        switch (data.action) {
            case "action":
                io.to(data.socketId).emit("action", data.value);
                break;

            case "sendDisconnect":
                io.to(data.socketId).emit("sendDisconnect", data.value);
                break;

            case "addMaster":
                if (data.value === undefined || data.value === "") {
                    return;
                }
                data.value = data.value.trim();

                const masterToAddIndex = masters.findIndex((e) => e === data.value);
                if (masterToAddIndex < 0) {
                    masters.push(data.value);
                }

                sendMastersOnline()
                break;

            case "removeMaster":
                if (data.value === undefined) {
                    return;
                }
                data.value = data.value.trim();

                const masterToRemoveIndex = masters.findIndex((e) => e === data.value);
                if (masterToRemoveIndex >= 0) {
                    masters.splice(masterToRemoveIndex, 1);
                }

                sendMastersOnline()
                break;

            case "setChests":
                if (data.value === undefined) {
                    return;
                }

                const newChests = data.value
                setChests(newChests);
                sendChests()
                break;

            case "getChests":
                socket.emit("action", { type: "getChests", value: chests });
                break;

            case "setPortals":
                if (data.value === undefined) {
                    return;
                }

                const newPortals = data.value;
                setPortals(newPortals)
                sendPortals()
                break;

            case "getPortals":
                socket.emit("action", { type: "getPortals", value: portals });
                break;
        }
    });

}