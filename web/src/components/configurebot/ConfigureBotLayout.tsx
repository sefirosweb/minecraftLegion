//@ts-nocheck
import { useContext, useEffect } from "react";
import { Button, Col, Row } from 'react-bootstrap'
import { Link, NavLink, Outlet } from 'react-router-dom'
import RenderBotsOnlineList from './../../components/RenderBotsOnlineList'
import { useDispatch } from "react-redux";
import { actionCreators, State } from "@/state";
import { useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { BotSelectedContext } from '@/utils/BotSelectedContext'

export const ConfigureBotLayout = () => {
  const botConfig = useContext(BotSelectedContext);
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    socket.emit("sendAction", {
      action: "getConfig",
      socketId: selectedSocketId,
      value: "",
    });

  }, [selectedSocketId, getBotBySocketId, socket])

  const updateReloadButton = () => {
    if (socket) {
      socket.emit("sendAction", {
        action: "action",
        socketId: selectedSocketId,
        toBotData: {
          type: "reloadConfig",
          value: "",
        },
      });
    }
  }

  return (
    <>
      <Row className="my-2">
        <Col md={6} lg={7}>
          <h2>Bot Configuration - {botConfig.name}</h2>
        </Col>
        <Col md={3}>
          <Button as={Link} to='/dashboard' className="mb-1">
            Dashboard
          </Button>
          {' '}
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
                <Outlet />
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
