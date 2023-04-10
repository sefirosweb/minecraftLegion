//@ts-nocheck
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarLayout from "./NavbarLayout";
import socketIOClient from "socket.io-client";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@/state";
import { Outlet } from "react-router";

export const Layout = () => {
  const dispatch = useDispatch();

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { webServerSocketURL, webServerSocketPort, webServerSocketPassword, master, selectedSocketId } = configurationState

  const botsState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botsState

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
    } = bindActionCreators(actionCreators, dispatch);

    let socketConection
    const interval = setTimeout(() => {


      console.log("Conecting to server...");

      socketConection = socketIOClient(`${webServerSocketURL}:${webServerSocketPort}`,);

      setSocket(socketConection);

      socketConection.on("connect", () => {
        setOnlineServer(true);
        console.log(
          `Connected to: ${webServerSocketURL}:${webServerSocketPort}`
        );

        socketConection.emit("login", webServerSocketPassword);
      });

      socketConection.on("login", (authenticate) => {
        if (authenticate.auth) {
          console.log('Logged in!');
          setLoged(true);

          socketConection.emit("sendAction", {
            action: "addMaster",
            value: master,
          });
          socketConection.emit("getBotsOnline");
          socketConection.emit("sendAction", { action: "getChests" });
          socketConection.emit("sendAction", { action: "getPortals" });
        } else {
          console.log('Login failed');
          setLoged(false);
        }
      });

      socketConection.on("disconnect", () => {
        setOnlineServer(false);
        setLoged(false);
        setBots([]);
      });

      socketConection.on("logs", (message) => {
        addLog(message);
      });

      socketConection.on("botStatus", (data) => {
        updateBotStatus(data);
      });

      socketConection.on("mastersOnline", (data) => {
        updateMasters(data);
      });

      socketConection.on("action", ({ type, value }) => {
        if (type === "getChests") {
          updateChests(value);
        }
      });
      socketConection.on("action", ({ type, value }) => {
        if (type === "getPortals") {
          updatePortals(value);
        }
      });

      socketConection.on("botsOnline", (botsOnline) => {
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

      socketConection.on("sendConfig", (data) => {
        setConfig(data);
      });
    }, 300)

    return () => {
      clearInterval(interval)
      if (socketConection) {
        console.log('Disconected from server')
        socketConection.disconnect()
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
          Core connected:
        </div>
      </div>
    </>
  );
}