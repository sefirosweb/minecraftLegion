import io, { Socket } from 'socket.io-client'
import { botSocket } from "base-types";
import { webServer, webServerPort, webServerPassword } from '@/config'
import { startBot } from '@/startBot';

const login = (): Promise<string> => {
    const url = `${webServer}:${webServerPort}/api/login`;
    const credentials = {
        password: webServerPassword
    };

    return new Promise((resolve) => {
        fetch(url, {
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

                resolve(cookies)
            })
            .catch(() => {
                console.log('Login failed, retry...')
                setTimeout(() => {
                    login()
                        .then(resolve)
                }, 3000)
            })
    })
}

const connectSocket = (cookies: string) => {
    const connectedTo = `${webServer}:${webServerPort}`

    const socket = io(connectedTo, {
        extraHeaders: {
            Cookie: cookies
        }
    });

    return socket
}

export const connectCore = () => {
    login()
        .then((cookie) => connectSocket(cookie))
        .then((socket) => {
            socket.on("connect", () => {
                console.log("Connected to webserver");
                socket.emit("botMaster", "on");
                socket.emit('isCore')
            });

            socket.on("disconnect", () => {
                console.log("Disconnected from webserver");
            });

            socket.on("botConnect", (data: botSocket) => {
                console.log(`Starting bot ${data.botName}`);
                startBot(data.botName, data.botPassword);
            });
        })
}

export const connectBotToServer = (): Promise<Socket> => {
    return new Promise((resolve) => {
        login()
            .then((cookie) => connectSocket(cookie))
            .then((socket) => resolve(socket))
    })
}