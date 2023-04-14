import io from 'socket.io-client'
import { botSocket, socketAuth } from "base-types";
import { webServer, webServerPort, webServerPassword } from '@/config'
import { startBot } from '@/startBot';

const verifyLogedIn = () => {

}

const login = (): Promise<string> => {
    const url = 'http://localhost:4001/api/login';
    const credentials = {
        password: 'admin'
    };

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            const cookies = response.headers.get('set-cookie');
            if (!cookies) {
                throw new Error('Session not iniziated!')
            }

            return cookies
        })
}

const connectSocket = (cookies: string) => {
    const connectedTo = `${webServer}:${webServerPort}`

    const socket = io(connectedTo, {
        extraHeaders: {
            Cookie: cookies
        }
    });

    let loged = false;

    socket.on("connect", () => {
        console.log("Connected to webserver");
        socket.emit("botMaster", "on");
        socket.emit('isCore')
    });

    socket.on("disconnect", () => {
        console.log("disconnected from webserver");
    });

    socket.on("botConnect", (data: botSocket) => {
        if (!loged) {
            return;
        }
        console.log(`Starting bot ${data.botName}`);
        startBot(data.botName, data.botPassword);
    });
}

export const connectToServer = () => {

    login()
        .then((cookie) => connectSocket(cookie))
}