import React, { Suspense, useContext } from "react";
import { Button, Card, Col, Nav, Row } from 'react-bootstrap'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { RenderBotsOnlineList } from '@/components'
import { useSendActionSocket } from "@/hooks/useSendActionSocket";
import { BotSelectedContext } from "./ConfigurationContext";
import { LoadingPage } from "../LoadingPage";
export const ConfigureBotLayout: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);
  const sendAction = useSendActionSocket()

  const updateReloadButton = () => {
    sendAction('action', {
      type: "reloadConfig",
      value: "",
    })
  }

  return (
    <>
      <Row className="my-2">

        <Col md={6} lg={7}>
          <h2>Bot Configuration - {botConfig.name}</h2>
        </Col>

        <Col md={3}>


          <Link to='/dashboard' className="me-2">
            <Button className="mb-1">
              Dashboard
            </Button>
          </Link>


          <Button onClick={updateReloadButton} variant='danger' className="mb-1">
            Reload
          </Button>

        </Col>
      </Row>

      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }} lg={10}>
          <Row>
            <Col>
              <Nav variant="tabs">
                <Nav.Item><Nav.Link as={NavLink} to='generalconfig'>General Configuration</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='itemstobeready'>Items To Be Ready</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='chests'>Chests</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='combat'>Combat</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='guardjob'>Guard Job</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='minerjob'>Miner Job</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='farmerjob'>Farmer Job</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='breederjob'>Breeder Job</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='sorterjob'>Sorter Job</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='processlist'>Process list</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={NavLink} to='full_config'>Full config</Nav.Link></Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className='py-4 px-5'>
                <Suspense fallback={<LoadingPage />}>
                  <Outlet />
                </Suspense>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xs={{ span: 12, order: 1 }} md={{ span: 3, order: 2 }} lg={2} className='mb-3'>
          <RenderBotsOnlineList />
        </Col>
      </Row>
    </>
  )
}
