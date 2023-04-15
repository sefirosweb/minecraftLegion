import { State, actionCreators } from '@/state';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Socket, io } from "socket.io-client";
import { useVerifyLoggedIn } from './useVerifyLoggedIn';

export const useSocketSetup = () => {
    const dispatch = useDispatch();
    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { webServerSocketURL, webServerSocketPort } = configurationState

    const verifyLoggedIn = useVerifyLoggedIn()

    useEffect(() => {
        const {
            setSocket,
            setConfig,
            setOnlineServer,
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
            const connectedTo = `${webServerSocketURL}:${webServerSocketPort}`
            console.log(`Conecting to server ${connectedTo}`);

            const socket = io(connectedTo, {
                withCredentials: true
            });

            tempSocket = socket

            setSocket(socket);

            socket.on("connect", () => {
                setOnlineServer(true);
                console.log(`Connected to: ${connectedTo}`);
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
                setOnlineServer(false);
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

            socket.on("botsOnline", (botsOnline) => {
                //@ts-ignore
                const botsConnected = botsOnline.sort(function (a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.firsnametname) {
                        return 1;
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

    }, [webServerSocketURL, webServerSocketPort])
}