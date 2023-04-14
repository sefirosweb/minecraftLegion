import { Session } from "express-session";

declare module "http" {
    interface IncomingMessage {
        cookieHolder?: string,
        session: Session & {
            logedIn?: boolean
        }
    }
}