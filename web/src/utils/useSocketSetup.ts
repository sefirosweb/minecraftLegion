import { useEffect } from 'react';
import { io } from "socket.io-client";
import { useVerifyLoggedIn } from './useVerifyLoggedIn';
import { Bot } from '@/types';
import { useStore } from '@/hooks/useStore';

const socket = io();

export const useSocketSetup = () => {

    const verifyLoggedIn = useVerifyLoggedIn()
    const setSocket = useStore(state => state.setSocket);
    const setBotsOnline = useStore(state => state.setBotsOnline);
    const setCoreConnected = useStore(state => state.setCoreConnected);
    const addLog = useStore(state => state.addLog);
    const updateBotStatus = useStore(state => state.updateBotStatus);
    const setMasters = useStore(state => state.setMasters);
    const setChests = useStore(state => state.setChests);
    const setPortals = useStore(state => state.setPortals);
    const setConfig = useStore(state => state.setConfig);

    useEffect(() => {
        setSocket(socket);
        socket.on("connect", () => {
            console.log(`Connected`);
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

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("logs");
            socket.off("botStatus");
            socket.off("mastersOnline");
            socket.off("coreConnected");
            socket.off("action");
            socket.off("botsOnline");
        }

    }, [setSocket, setBotsOnline, setCoreConnected, addLog, updateBotStatus, setMasters, setChests, setPortals, setConfig, verifyLoggedIn])
}