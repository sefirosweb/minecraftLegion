import { Col, Form, Row } from 'react-bootstrap';

type Props = {
    label?: string
    coords: Coords
    onChange: (e: React.ChangeEvent<HTMLInputElement>, pos: keyof Coords) => React.ChangeEventHandler
}

const Coords = (props: Props) => {
    const {
        label = '',
        onChange,
        coords,
    } = props
    return (
        <>
            {
                label ?
                    <Row className='mb-2'>
                        <Col>
                            {label}
                        </Col>
                    </Row>
                    : ''
            }

            <Row>
                <Form.Group as={Col} sm="4" md="3" lg="2">
                    <Form.Label><span className='badge bg-primary text-white'>X</span></Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.x}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'x') }}
                    />
                </Form.Group>

                <Form.Group as={Col} sm="4" md="3" lg="2">
                    <Form.Label><span className='badge bg-warning text-dark'>Y</span></Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.y}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'y') }}
                    />
                </Form.Group>

                <Form.Group as={Col} sm="4" md="3" lg="2">
                    <Form.Label><span className='badge bg-secondary text-white'>Z</span></Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.z}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'z') }}
                    />
                </Form.Group>
            </Row>
        </>
    )
}

export default Coords