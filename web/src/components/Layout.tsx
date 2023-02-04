//@ts-nocheck
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarLayout from "./NavbarLayout";
import socketIOClient from "socket.io-client";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@/state";

const Layout = (props) => {
  const { socket, children } = props

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const {
    webServerSocketURL,
    webServerSocketPort,
    webServerSocketPassword,
    master
  } = configurationState

  const dispatch = useDispatch();

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

    console.log("Conecting to server...");

    if (socket !== undefined) {
      socket.disconnect();
      socket.close();
    }

    const socketConection = socketIOClient(
      `${webServerSocketURL}:${webServerSocketPort}`,
      {
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd",
        },
      }
    );

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

    return () => socketConection.disconnect();
  }, [master, socket, webServerSocketPassword, webServerSocketPort, webServerSocketURL, dispatch])

  return (
    <>
      <NavbarLayout />
      <div className="container">{children}</div>
    </>
  );
}

export default Layout

// const mapStateToProps = (reducers) => {
//   const { botsReducer, configurationReducer } = reducers;
//   const { botsOnline } = botsReducer;
//   const {
//     webServerSocketURL,
//     webServerSocketPort,
//     webServerSocketPassword,
//     master,
//   } = configurationReducer;

//   return {
//     webServerSocketURL,
//     webServerSocketPort,
//     webServerSocketPassword,
//     botsOnline,
//     master,
//   };
// };

// const mapDispatchToProps = {
//   setLoged,
//   setSocket,
//   setConfig,
//   setOnlineServer,
//   updateMasters,
//   updateChests,
//   updatePortals,
//   setBots,
//   addLog,
//   updateBotStatus,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Layout);
