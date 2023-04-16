import { useGetSelectedBot } from "@/hooks/useGetSelectedBot";
import { actionCreators, State } from "@/state";
import { getPort } from "@/utils/getFreePort";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { bindActionCreators } from "redux";

const BotActionButtons = () => {
  const { selectedSocketId } = useParams()
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, serverBots, master } = configurationState
  const bot = useGetSelectedBot(selectedSocketId) as Bot
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { updateBotStatus } = bindActionCreators(actionCreators, dispatch);

  const [chat, setChat] = useState("");

  const handleChangeMessage = (event: ChangeEvent<HTMLInputElement>) => {
    setChat(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessageButton();
    }
  };

  const handleSendMessageButton = () => {
    handleSendAction("sendMessage", chat);
    setChat("");
  };

  const handleDisconnectButton = () => {
    socket.emit("sendAction", {
      socketId: selectedSocketId,
      action: "sendDisconnect",
      value: "Disconnect Bot",
    });
  };

  const handleStartStateMachineButton = () => {
    let port = bot.stateMachinePort
    if (!port) {
      port = getPort()
      socket.emit("sendAction", {
        action: "startStateMachine",
        socketId: selectedSocketId,
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
    let port = bot.inventoryPort
    if (!port) {
      port = getPort()
      socket.emit("sendAction", {
        action: "startInventory",
        socketId: selectedSocketId,
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
    let port = bot.viewerPort
    if (!port) {
      port = getPort()
      socket.emit("sendAction", {
        action: "startViewer",
        socketId: selectedSocketId,
        value: {
          port,
        },
      });
      bot.viewerPort = port;
      updateBotStatus(bot);
    }
    window.open(`http://${serverBots}:${port}`, "_blank");
  };

  const handleSendAction = (type: string, value: string) => {
    socket.emit("sendAction", {
      action: "action",
      socketId: selectedSocketId,
      toBotData: {
        type: type,
        value: value,
      },
    });
  };

  useEffect(() => {
    const interval = setTimeout(() => {
      if (!bot) {
        navigate("/dashboard");
      }
    })
    return () => {
      clearInterval(interval)
    }
  }, [bot])


  return (
    <>

      <Row className="mb-3">
        <Col>
          <div className="form-group">
            <input
              type="text"
              placeholder="Send chat message"
              className="form-control"
              onKeyDown={handleKeyPress}
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