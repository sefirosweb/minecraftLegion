import React from 'react';
import { Badge, Col, Form, Row } from 'react-bootstrap';
import { Vec3 } from 'vec3';

type Props = {
    label?: string
    coords: Vec3
    onChange: (e: React.ChangeEvent<HTMLInputElement>, pos: keyof Vec3) => React.ChangeEventHandler
}

export const Coords: React.FC<Props> = (props) => {
    const { label = '', onChange, coords, } = props

    return (
        <>
            {label &&
                <div className='mb-2'>
                    {label}
                </div>
            }

            <Row>
                <Form.Group as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge>X</Badge>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.x}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e, 'x')}
                    />
                </Form.Group>

                <Form.Group as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge bg='warning' text='dark' >Y</Badge>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.y}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e, 'y')}
                    />
                </Form.Group>

                <Form.Group as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge bg='danger'>Z</Badge>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        value={coords.z}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e, 'z')}
                    />
                </Form.Group>
            </Row>
        </>
    )
}
