import React, { createContext, useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, Outlet, useParams } from "react-router-dom";
import { useGetSelectedBot } from '@/hooks/useGetSelectedBot';
import useGetSocket from '@/hooks/useGetSocket';
import { RenderBotsOnlineList } from '@/components';
import { useSendActionSocket } from '@/hooks/useSendActionSocket';

export const BotSelectedContext = createContext<Bot>({} as Bot);

export const ConfigurationContextProvider: React.FC = () => {
  const { selectedSocketId } = useParams()
  const socket = useGetSocket()
  const bot = useGetSelectedBot()

  const sendAction = useSendActionSocket()

  useEffect(() => {
    const interval = setTimeout(() => {
      sendAction("getBotsOnline", "")
    });
    return (() => clearInterval(interval))
  }, [selectedSocketId, socket])


  if (selectedSocketId === undefined || bot === undefined) {
    return (
      <>
        <Row className="my-2">
          <Col md={6} lg={7}>
            <h2>Select the bot</h2>
          </Col>
          <Col md={3}>
            <Link to='/dashboard'>
              <Button className="mb-1">
                Dashboard
              </Button>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }} lg={10}>
          </Col>
          <Col xs={{ span: 12, order: 1 }} md={{ span: 3, order: 2 }} lg={2} className='mb-3'>
            <RenderBotsOnlineList />
          </Col>
        </Row>
      </>
    )
  }


  return (
    <BotSelectedContext.Provider value={bot}>
      <Outlet />
    </BotSelectedContext.Provider>
  )
}
