import { actionCreators } from '@/state';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Socket, io } from "socket.io-client";
import { useVerifyLoggedIn } from './useVerifyLoggedIn';
import { Bot } from '@/types';

export const useSocketSetup = () => {
    const dispatch = useDispatch();

    const verifyLoggedIn = useVerifyLoggedIn()

    useEffect(() => {
        const {
            setSocket,
            setConfig,
            updateMasters,
            updateChests,
            updatePortals,
            setBots,
            addLog,
            updateBotStatus,
            setCoreConnection
        } = bindActionCreators(actionCreators, dispatch);

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
                console.log("disconnect")
                setBots([]);
                setCoreConnection(false)
            });

            socket.on("logs", (message) => {
                addLog(message);
            });

            socket.on("botStatus", (data) => {
                updateBotStatus(data);
            });

            socket.on("mastersOnline", (data) => {
                updateMasters(data);
            });

            socket.on("coreConnected", (connected: boolean) => {
                console.log('Core connected connected => ', connected)
                setCoreConnection(connected);
            });

            socket.on("action", ({ type, value }) => {
                if (type === "getChests") {
                    updateChests(value);
                }
            });

            socket.on("action", ({ type, value }) => {
                if (type === "getPortals") {
                    updatePortals(value);
                }
            });

            socket.on("botsOnline", (botsOnline: Array<Bot>) => {
                const botsConnected = botsOnline.sort(function (a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                });

                setBots(botsConnected);
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