import React, { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BotActionButtons } from './BotActionsButtons'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { RenderBotsOnlineList } from '@/components';
import { useStore } from '@/hooks/useStore';

export const Dashboard: React.FC = () => {
    const { selectedSocketId } = useParams()
    const logs = useStore(state => state.logs)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs]);

    return (
        <>
            <Row className='align-items-end'>
                <Col md={6} lg={8} className='mb-2'>
                    <span className='fs-2 fw-bold'>Dashboard</span>
                </Col>

                {selectedSocketId &&
                    <Col md={3} lg={2} className='mb-2'>
                        <Link to={`/configurebot/${selectedSocketId}/generalconfig`}>
                            <Button variant='warning'>
                                Configure Bot
                            </Button>
                        </Link>
                    </Col>
                }
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
                                <BotActionButtons /> :
                                <Alert variant='danger'>
                                    Select any bot for do actions
                                </Alert>

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
