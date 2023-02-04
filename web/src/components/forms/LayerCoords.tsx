import { Col, Form, Row } from 'react-bootstrap';

type Props = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>, pos: keyof Layer) => void
    area: Layer
}

const LayerCoords = (props: Props) => {
    const { onChange, area, } = props
    return (
        <Row>

            <Form.Group as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-primary text-white'>X Start</span></Form.Label>
                <Form.Control
                    type="text"
                    value={area.xStart}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'xStart') }}
                />
            </Form.Group>

            <Form.Group as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-warning text-dark'>Y Layer</span></Form.Label>
                <Form.Control
                    type="text"
                    value={area.yLayer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'yLayer') }}
                />
            </Form.Group>

            <Form.Group as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-secondary text-white'>Z Start</span></Form.Label>
                <Form.Control
                    type="text"
                    value={area.zStart}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'zStart') }}
                />
            </Form.Group>

            <Form.Group as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-primary text-white'>X End</span></Form.Label>
                <Form.Control
                    type="text"
                    value={area.xEnd}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'xEnd') }}
                />
            </Form.Group>

            <Form.Group as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-secondary text-white'>Z End</span></Form.Label>
                <Form.Control
                    type="text"
                    value={area.zEnd}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onChange(e, 'zEnd') }}
                />
            </Form.Group>

        </Row >
    )
}

export default LayerCoords;
