//@ts-nocheck
import { actionCreators, State } from "@/state";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { bindActionCreators } from "redux";

const BotActionButtons = (props) => {
  const { socketId } = props
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId, serverBots, master } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId, updateBotStatus } = bindActionCreators(actionCreators, dispatch);


  const navigation = useNavigate();
  const [chat, setChat] = useState("");

  const handleChangeMessage = (event) => {
    setChat(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.charCode === 13) {
      handleSendMessageButton();
    }
  };

  const handleSendMessageButton = () => {
    handleSendAction("sendMessage", chat);
    setChat("");
  };

  const handleDisconnectButton = () => {
    socket.emit("sendAction", {
      action: "sendDisconnect",
      socketId,
      value: "Disconnect Bot",
    });
    navigation("/");
  };

  const handleStartStateMachineButton = () => {
    const bot = getBotBySocketId(socketId);
    let port = bot.stateMachinePort
    if (!port) {
      port = Math.floor(Math.random() * 50 + 1) + 4500;
      socket.emit("sendAction", {
        action: "startStateMachine",
        socketId,
        value: {
          port,
        },
      });
      bot.stateMachinePort = port;
      updateBotStatus(bot);
    }
    window.open(`http://${serverBots}:${port}`, "_blank");
  };

  const handleStartInventoryButton = () => {
    const bot = getBotBySocketId(socketId);
    let port = bot.inventoryPort
    if (!port) {
      port = Math.floor(Math.random() * 50 + 1) + 4500;
      socket.emit("sendAction", {
        action: "startInventory",
        socketId,
        value: {
          port,
        },
      });
      bot.inventoryPort = port;
      updateBotStatus(bot);
    }
    window.open(`http://${serverBots}:${port}`, "_blank");
  };

  const handleStartViewerButton = () => {
    const bot = getBotBySocketId(socketId);
    let port = bot.viewerPort
    if (!port) {
      port = Math.floor(Math.random() * 50 + 1) + 4500;
      socket.emit("sendAction", {
        action: "startViewer",
        socketId,
        value: {
          port,
        },
      });
      bot.viewerPort = port;
      updateBotStatus(bot);
    }
    window.open(`http://${serverBots}:${port}`, "_blank");
  };

  const handleSendAction = (type, value) => {
    socket.emit("sendAction", {
      action: "action",
      socketId: selectedSocketId,
      toBotData: {
        type: type,
        value: value,
      },
    });
  };

  return (
    <>

      <Row className="mb-3">
        <Col>
          <div className="form-group">
            <input
              type="text"
              placeholder="Send chat message"
              className="form-control"
              onKeyPress={handleKeyPress}
              onChange={handleChangeMessage}
              value={chat}
            />
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button onClick={handleSendMessageButton} className='mb-1'>
            Send Message
          </Button>
          {' '}
          <Button onClick={handleStartStateMachineButton} variant='success' className='mb-1'>
            Show State Machine
          </Button>
          {' '}
          <Button onClick={handleStartInventoryButton} variant='success' className='mb-1'>
            Show Item Inventory
          </Button>
          {' '}
          <Button onClick={handleStartViewerButton} variant='success' className='mb-1'>
            Show Viewer
          </Button>
          {' '}
          <Button onClick={handleDisconnectButton} variant='danger' className='mb-1'>
            Disconnect
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button onClick={() => handleSendAction("stay", "")} variant='secondary'>
            Stay
          </Button>
          {' '}
          <Button onClick={() => handleSendAction("follow", master)} variant='secondary'>
            Follow Master
          </Button>
          {' '}
          <Button onClick={() => handleSendAction("endCommands", "")} variant='warning'>
            End commands
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>

          <Row className="mb-3">

            <Col xs={{ span: 4, offset: 4 }} className="d-grid">
              <Button onClick={() => handleSendAction("moveOneByOne", "x+")} variant='secondary'>
                X+
              </Button>
            </Col>

          </Row>

          <Row>

            <Col xs={4} className="d-grid mb-3">
              <Button onClick={() => handleSendAction("moveOneByOne", "z-")} variant='secondary'>
                Z-
              </Button>
            </Col>

            <Col xs={4} className="d-grid mb-3">
              <Button onClick={() => handleSendAction("moveOneByOne", "x-")} variant='secondary'>
                X-
              </Button>
            </Col>

            <Col xs={4} className="d-grid mb-3">
              <Button onClick={() => handleSendAction("moveOneByOne", "z+")} variant='secondary'>
                Z+
              </Button>
            </Col>

          </Row>
        </Col>

        <Col md={2} className='d-grid mb-3'>
          <Button onClick={() => handleSendAction("interactWithPlayer", "")} variant='secondary'>
            Interact With Player
          </Button>
        </Col>
        <Col md={2} className='d-grid mb-3'>
          <Button onClick={() => handleSendAction("interactWithBed", "")} variant='secondary'>
            Interect With Bed
          </Button>
        </Col>
        <Col md={2} className='d-grid mb-3'>
          <Button onClick={() => handleSendAction("tossAllItems", "")} variant='danger'>
            Toss all items
          </Button>
        </Col>
      </Row >

    </>
  );
};

export default BotActionButtons

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers;
//   const { socket, selectedSocketId, serverBots, master } = configurationReducer;

//   return { socket, selectedSocketId, serverBots, master };
// };

// const mapDispatchToProps = {
//   updateBotStatus,
//   getBotBySocketId,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(BotActionButtons);
