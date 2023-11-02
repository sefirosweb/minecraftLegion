import React, { Fragment } from 'react'
import { useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { Col, Row } from 'react-bootstrap'
import { actionCreators } from '@/state'
import { bindActionCreators } from 'redux'
import { useGetMaster } from '@/hooks/useGetMaster'

export const Configuration: React.FC = () => {
    const master = useGetMaster()

    const dispatch = useDispatch();
    const { updateMaster, } = bindActionCreators(actionCreators, dispatch);

    const handleChangeMaster = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateMaster(event.target.value)
    }

    return (
        <Fragment>
            <Row>
                <Col>
                    <h1>Configuration</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>

                        <Form.Group controlId="handleChangeMaster">
                            <Form.Label>Your name in game</Form.Label>
                            <Form.Control type="text" value={master} onChange={handleChangeMaster} />
                        </Form.Group>

                    </Form>
                </Col>
            </Row>
        </Fragment>
    );

}
