import { State, actionCreators } from '@/state';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import socketIOClient, { Socket } from "socket.io-client";

export const useSocketSetup = () => {
    const dispatch = useDispatch();
    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { webServerSocketURL, webServerSocketPort, webServerSocketPassword, master } = configurationState

    useEffect(() => {
        const {
            setLoged,
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

        let socket: Socket | undefined
        const interval = setTimeout(() => {

            console.log("Conecting to server...");

            socket = socketIOClient(`${webServerSocketURL}:${webServerSocketPort}`, {
                withCredentials: true
            });

            setSocket(socket);

            socket.on("connect", () => {
                setOnlineServer(true);
                console.log(
                    `Connected to: ${webServerSocketURL}:${webServerSocketPort}`
                );

                if (!socket) return
                socket.emit("login", webServerSocketPassword);
            });

            socket.on("disconnect", () => {
                setOnlineServer(false);
                setBots([]);
                setCoreConnection(false)
                setLoged(false)
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
                console.log('connected')
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
        }, 300)

        return () => {
            clearInterval(interval)
            if (socket) {
                console.log('Disconected from server')
                socket.disconnect()
            }
        };
    }, [master, webServerSocketPassword, webServerSocketPort, webServerSocketURL, dispatch])
}