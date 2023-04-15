import { socketVariables } from "@/libs/socketVariables";
import { io } from "@/server";

export const sendCoreIsConnected = () => {
    io.to("usersLoged").emit("coreConnected", socketVariables.usersCoreLogged.length > 0);
}