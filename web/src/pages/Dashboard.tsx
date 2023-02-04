import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import RenderBotsOnlineList from '../components/RenderBotsOnlineList'
import BotActionsButtons from '../components/BotActionsButtons'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from "react-redux";
import { State } from "@/state";

const Dashboard = () => {
    const botState = useSelector((state: State) => state.botsReducer);
    const { logs } = botState

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { selectedSocketId } = configurationState

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs]);

    return (
        <>
            <Row className='mt-3'>
                <Col md={8} className='mb-3'>
                    <h1>Dashboard</h1>
                </Col>

                <Col md={2} className='mb-3'>
                    {selectedSocketId &&
                        <Link to='/configurebot/generalconfig' style={{ textDecoration: "none", display: "grid" }}>
                            <Button variant='warning'>
                                Configure Bot
                            </Button>
                        </Link>
                    }
                </Col>
            </Row>

            <Row>
                <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }} lg={10}>

                    <Row className='mb-3'>
                        <Col xs={12}>
                            <div className='form-group'>
                                <div className='textAreaStyle form-control'>
                                    {
                                        logs
                                            .filter(log => selectedSocketId === undefined || log.socketId === selectedSocketId)
                                            .map((log, key) => <div key={key}>{log.time} {log.botName} {log.message}</div>)
                                    }
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12}>
                            {selectedSocketId ?
                                <BotActionsButtons socketId={selectedSocketId} /> :
                                <div className='pendingSelectBot'>Select any bot for do actions</div>
                            }
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

export default Dashboard