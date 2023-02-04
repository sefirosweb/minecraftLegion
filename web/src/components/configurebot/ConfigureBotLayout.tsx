//@ts-nocheck
import { useEffect, useState } from "react";
import { Button, Col, Row } from 'react-bootstrap'
import { Link, NavLink, Outlet } from 'react-router-dom'
import RenderBotsOnlineList from './../../components/RenderBotsOnlineList'
import { useDispatch } from "react-redux";
import { actionCreators, State } from "@/state";
import { useSelector } from "react-redux";
import { bindActionCreators } from "redux";


const ConfigureBotLayout = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);

  const [botName, setBotName] = useState('')

  useEffect(() => {
    socket.emit("sendAction", {
      action: "getConfig",
      socketId: selectedSocketId,
      value: "",
    });

    setBotName(getBotBySocketId(selectedSocketId).name)
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
          <h2>Bot Configuration - {botName ? botName : ''}</h2>
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
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/generalconfig'>General Configuration</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/itemstobeready'>Items To Be Ready</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/chests'>Chests</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/combat'>Combat</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/guardjob'>Guard Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/minerjob'>Miner Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/farmerjob'>Farmer Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/breederjob'>Breeder Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/sorterjob'>Sorter Job</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/processlist'>Process list</NavLink></li>
                <li className='nav-item'><NavLink className='nav-link linkSpan' to='/configurebot/full_config'>Full config</NavLink></li>
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

export default ConfigureBotLayout