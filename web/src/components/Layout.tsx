//@ts-nocheck
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarLayout from "./NavbarLayout";
import socketIOClient from "socket.io-client";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@/state";
import { Outlet } from "react-router";
import { Socket } from "socket.io-client";
import green_lamp from '@/images/green_lamp.png'
import red_lamp from '@/images/red_lamp.png'

export const Layout = () => {
  const dispatch = useDispatch();

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { webServerSocketURL, webServerSocketPort, webServerSocketPassword, master, selectedSocketId } = configurationState

  const botsState = useSelector((state: State) => state.botsReducer);
  const { botsOnline, coreConnected } = botsState

  const { setSelectedSocketId } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    if (!selectedSocketId) return

    const bot = botsOnline.find((e) => { return e.socketId === selectedSocketId })
    if (!bot) {
      setSelectedSocketId(null)
    }

  }, [botsOnline, selectedSocketId, setSelectedSocketId])

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

      socket = socketIOClient(`${webServerSocketURL}:${webServerSocketPort}`,);

      setSocket(socket);

      socket.on("connect", () => {
        setOnlineServer(true);
        console.log(
          `Connected to: ${webServerSocketURL}:${webServerSocketPort}`
        );

        socket.emit("login", webServerSocketPassword);
      });

      socket.on("login", (authenticate) => {
        if (authenticate.auth) {
          console.log('Logged in!');
          setLoged(true);

          socket.emit("sendAction", {
            action: "addMaster",
            value: master,
          });

          socket.emit("getBotsOnline");
          socket.emit("sendAction", { action: "getChests" });
          socket.emit("sendAction", { action: "getPortals" });

        } else {
          console.log('Login failed');
          setLoged(false);
        }
      });

      socket.on("disconnect", () => {
        setOnlineServer(false);
        setLoged(false);
        setBots([]);
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

  return (
    <>
      <NavbarLayout />
      <div className="container">
        <Outlet />
      </div>

      <div className="fixed-bottom bg-light">
        <div className="container">
          <div className="d-flex align-items-center">
            <span className="me-2">Core connected:</span> <img width={'16px'} src={coreConnected ? green_lamp : red_lamp} />
          </div>
        </div>
      </div>
    </>
  );
}