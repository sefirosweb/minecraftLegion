import RenderBotsOnlineList from '@/components/RenderBotsOnlineList';
import { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, Outlet, useParams } from "react-router-dom";
import { BotSelectedContext } from '@/utils/BotSelectedContext'
import useGetSelectedBot from './useGetSelectedBot';

export const SelectedBot = () => {
  const { selectedSocketId } = useParams()
  const [socketId, setSocketId] = useState<string | undefined>(undefined)

  useEffect(() => {
    setSocketId(socketId)
  }, [selectedSocketId, setSocketId])

  const bot = useGetSelectedBot(selectedSocketId)

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

  console.log(bot)

  return (
    <BotSelectedContext.Provider value={bot}>
      <Outlet />
    </BotSelectedContext.Provider>
  )
}
