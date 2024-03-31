import React, { Suspense, useContext } from "react";
import { Button, Card, Col, Nav, Row } from 'react-bootstrap'
import { Link, NavLink, Outlet } from 'react-router-dom'
import toastr from 'toastr'
import { RenderBotsOnlineList } from '@/components'
// import { useSendActionSocket } from "@/hooks/useSendActionSocket";
import { BotSelectedContext } from "./ConfigurationContext";
import { LoadingPage } from "../LoadingPage";
import axios from "axios";
export const ConfigureBotLayout: React.FC = () => {
  const { bot, botConfig } = useContext(BotSelectedContext);
  // const sendAction = useSendActionSocket()

  const handleSaveButton = () => {
    // sendAction('action', {
    //   type: "reloadConfig",
    //   value: "",
    // })
    axios
      .post(`/api/save_bot_config/${bot.socketId}`, { botConfig })
      .then((response) => {
        toastr.success('Config saved')
      })
      .catch((error) => {
        toastr.error('Error saving config')
      })
  }

  return (
    <>
      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }} lg={10}>
          <div className="d-flex align-items-end justify-content-between flex-wrap my-2">

            <div className="me-3">
              <h2>Bot Configuration - {bot.name}</h2>
            </div>

            <div>
              <Link to='/dashboard' className="me-2">
                <Button className="mb-1" variant="secondary">
                  Dashboard
                </Button>
              </Link>


              <Button onClick={handleSaveButton} variant='success' className="mb-1">
                Save
              </Button>

            </div>
          </div>
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
              <Card className='py-2 px-2 py-sm-4 px-sm-5'>
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
