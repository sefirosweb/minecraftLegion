import { socketVariables } from "@/libs/socketVariables";
import { io } from "@/server";

export const sendMastersOnline = () => {
    io.to("core").to('web').emit("mastersOnline", socketVariables.masters);
}
