import { useEffect } from 'react';
import { Socket, io } from "socket.io-client";
import { useVerifyLoggedIn } from './useVerifyLoggedIn';
import { Bot } from '@/types';
import { useStore } from '@/hooks/useStore';

export const useSocketSetup = () => {
    const verifyLoggedIn = useVerifyLoggedIn()
    const [
        setSocket,
        setBotsOnline,
        setCoreConnected,
        addLog,
        updateBotStatus,
        setMasters,
        setChests,
        setPortals,
        setConfig] =
        useStore(state => [
            state.setSocket,
            state.setBotsOnline,
            state.setCoreConnected,
            state.addLog,
            state.updateBotStatus,
            state.setMasters,
            state.setChests,
            state.setPortals,
            state.setConfig
        ])

    useEffect(() => {
        let tempSocket: Socket | undefined
        const interval = setTimeout(() => {
            console.log(`Conecting to server`);
            const socket = io();
            tempSocket = socket
            setSocket(socket);
            socket.on("connect", () => {
                console.log(`Connected to`);
                socket.emit('isWeb')
            });

            socket.on("connect_error", (err) => {
                console.log(err.message)
                verifyLoggedIn()
                    .then(() => {
                        setTimeout(() => {
                            if (socket) {
                                socket.connect();
                            }
                        }, 3000);
                    })
            });

            socket.on("disconnect", () => {
                setBotsOnline([]);
                setCoreConnected(false)
            });

            socket.on("logs", (message) => {
                addLog(message);
            });

            socket.on("botStatus", (data) => {
                updateBotStatus(data);
            });

            socket.on("mastersOnline", (data) => {
                setMasters(data);
            });

            socket.on("coreConnected", (connected: boolean) => {
                setCoreConnected(connected);
            });

            socket.on("action", ({ type, value }) => {
                if (type === "getChests") {
                    setChests(value);
                }
            });

            socket.on("action", ({ type, value }) => {
                if (type === "getPortals") {
                    setPortals(value);
                }
            });

            socket.on("botsOnline", (botsOnline: Array<Bot>) => {
                const botsConnected = botsOnline.sort(function (a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                });

                setBotsOnline(botsConnected);
            });

            socket.on("sendConfig", (data) => {
                setConfig(data);
            });

        })

        return () => {
            clearInterval(interval)
            if (tempSocket) {
                console.log('remove socket')
                console.log('Disconected from server')
                tempSocket.off('connect_error');
                tempSocket.disconnect()
                tempSocket = undefined
            }
        };

    }, [])
}