import { Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { Col, Row } from 'react-bootstrap'
import { actionCreators, State } from '@/state'
import { bindActionCreators } from 'redux'

export const Configuration = () => {

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const { master } = configurationState

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
