import { Suspense, useContext } from "react";
import { Button, Col, Row } from 'react-bootstrap'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { RenderBotsOnlineList } from '@/components'
import { useSendActionSocket } from "@/hooks/useSendActionSocket";
import { BotSelectedContext } from "./ConfigurationContext";
import { LoadingPage } from "../LoadingPage";

export const ConfigureBotLayout = () => {
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
              <ul className='nav nav-tabs bg-dark'>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='generalconfig'>General Configuration</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='itemstobeready'>Items To Be Ready</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='chests'>Chests</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='combat'>Combat</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='guardjob'>Guard Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='minerjob'>Miner Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='farmerjob'>Farmer Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='breederjob'>Breeder Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='sorterjob'>Sorter Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='processlist'>Process list</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='full_config'>Full config</NavLink></li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className='card px-5 pt-4 mr-0'>
                <Suspense fallback={<LoadingPage />}>
                  <Outlet />
                </Suspense>
              </div>
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
