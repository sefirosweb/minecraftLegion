import { socketVariables } from "@/libs/socketVariables";
import { io } from "@/server";

export const sendMastersOnline = () => {
    io.to("usersLoged").emit("mastersOnline", socketVariables.masters);
}
