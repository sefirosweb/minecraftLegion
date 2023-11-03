import React, { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import BotActionsButtons from './BotActionsButtons'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from "react-redux";
import { RenderBotsOnlineList } from '@/components';
import { State } from "@/state";

export const Dashboard: React.FC = () => {
    const { selectedSocketId } = useParams()
    const botState = useSelector((state: State) => state.botsReducer);
    const { logs } = botState

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs]);

    return (
        <>
            <Row>
                <Col md={6} lg={8} className='mb-3'>
                    <h1>Dashboard</h1>
                </Col>

                <Col md={3} lg={2} className='mb-3'>
                    {selectedSocketId &&
                        <Link to={`/configurebot/${selectedSocketId}/generalconfig`} style={{ textDecoration: "none", display: "grid" }}>
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
                                    {logs
                                        .filter(log => selectedSocketId === undefined || log.socketId === selectedSocketId)
                                        .map((log, key) => <div key={key}>{log.time} {log.botName} {typeof log.message === "string" ? log.message : JSON.stringify(log.message)}</div>)}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12}>
                            {selectedSocketId ?
                                <BotActionsButtons /> :
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