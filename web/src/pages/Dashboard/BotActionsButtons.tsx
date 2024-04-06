import { useGetSelectedBot } from "@/hooks/useGetSelectedBot";
import { useStore } from "@/hooks/useStore";
import { Bot } from "@/types";
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";


export const BotActionButtons: React.FC = () => {
  const selectedSocketId = useParams().selectedSocketId
  const bot = useGetSelectedBot() as Bot
  const navigate = useNavigate();
  const [master, socket] = useStore(state => [state.master, state.socket])

  const sendAction = (action: string, value?: any) => {
    socket?.emit("sendAction", {
      action,
      socketId: selectedSocketId,
      value,
    });
  }

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
          <Button
            href={`/viewer/${selectedSocketId}/state_machine/`}
            target="_blank"
            variant='success' className='mb-1'>
            Show State Machine
          </Button>
          {' '}
          <Button
            href={`/viewer/${selectedSocketId}/inventory_viewer/`}
            target="_blank"
            variant='success' className='mb-1'>
            Show Item Inventory
          </Button>
          {' '}
          <Button
            href={`/viewer/${selectedSocketId}/world/`}
            target="_blank"
            variant='success' className='mb-1'>
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
