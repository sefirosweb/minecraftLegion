import { useGetSelectedBot } from "@/hooks/useGetSelectedBot";
import { useSendActionSocket } from "@/hooks/useSendActionSocket";
import { useStore } from "@/hooks/useStore";
import { Bot } from "@/types";
import { getPort } from "@/utils/getFreePort";
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";

export const BotActionButtons: React.FC = () => {
  const bot = useGetSelectedBot() as Bot
  const navigate = useNavigate();
  const sendAction = useSendActionSocket()

  const updateBotStatus = useStore(state => state.updateBotStatus)
  const master = useStore(state => state.master)

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
    sendAction('sendDisconnect', 'Disconnect Bot')
  };

  const handleStartStateMachineButton = () => {
    let port = bot.stateMachinePort
    if (!port) {
      port = getPort()

      sendAction('startStateMachine', {
        port,
      })

      updateBotStatus({
        socketId: bot.socketId,
        type: 'stateMachinePort',
        value: port
      });
    }
    window.open(`http://${window.location.hostname}:${port}`, "_blank");
  };

  const handleStartInventoryButton = () => {
    let port = bot.inventoryPort
    if (!port) {
      port = getPort()

      sendAction('startInventory', {
        port
      })


      updateBotStatus({
        socketId: bot.socketId,
        type: 'inventoryPort',
        value: port
      });
    }
    window.open(`http://${window.location.hostname}:${port}`, "_blank");
  };

  const handleStartViewerButton = () => {
    let port = bot.viewerPort
    if (!port) {
      port = getPort()

      sendAction('startViewer', {
        port
      })

      updateBotStatus({
        socketId: bot.socketId,
        type: 'viewerPort',
        value: port
      });
    }
    window.open(`http://${window.location.hostname}:${port}`, "_blank");
  };

  const handleSendAction = (type: string, value: string) => {
    sendAction('action', {
      type: type,
      value: value,
    })
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
