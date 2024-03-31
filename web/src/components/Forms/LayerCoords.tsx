import React, { useEffect, useState } from 'react';
import { Layer } from 'base-types';
import { Col, Form, Row } from 'react-bootstrap';

type Props = {
    onChange: (area: Layer) => void
    area: Layer
}

export const LayerCoords: React.FC<Props> = (props) => {
    const { onChange, area, } = props

    const [yLayer, setYLayer] = useState<string>(area?.yLayer?.toString() ?? '')
    const [xStart, setXStart] = useState<string>(area?.xStart?.toString() ?? '')
    const [xEnd, setXEnd] = useState<string>(area?.xEnd?.toString() ?? '')
    const [zStart, setZStart] = useState<string>(area?.zStart?.toString() ?? '')
    const [zEnd, setZEnd] = useState<string>(area?.zEnd?.toString() ?? '')

    useEffect(() => {
        const validAllValues = !isNaN(parseInt(yLayer)) && !isNaN(parseInt(xStart)) && !isNaN(parseInt(xEnd)) && !isNaN(parseInt(zStart)) && !isNaN(parseInt(zEnd))
        if (!validAllValues) return
        if (validAllValues && area && area.yLayer === parseInt(yLayer) && area.xStart === parseInt(xStart) && area.xEnd === parseInt(xEnd) && area.zStart === parseInt(zStart) && area.zEnd === parseInt(zEnd)) return
        const newLayer: Layer = {
            uuid: area.uuid,
            yLayer: parseInt(yLayer),
            xStart: parseInt(xStart),
            xEnd: parseInt(xEnd),
            zStart: parseInt(zStart),
            zEnd: parseInt(zEnd)
        }
        onChange(newLayer)
    }, [yLayer, xStart, xEnd, zStart, zEnd, onChange])

    useEffect(() => {
        const validAllValues = !isNaN(parseInt(yLayer)) && !isNaN(parseInt(xStart)) && !isNaN(parseInt(xEnd)) && !isNaN(parseInt(zStart)) && !isNaN(parseInt(zEnd))
        if (!validAllValues && !area) return
        if (validAllValues && area && area.yLayer === parseInt(yLayer) && area.xStart === parseInt(xStart) && area.xEnd === parseInt(xEnd) && area.zStart === parseInt(zStart) && area.zEnd === parseInt(zEnd)) return
        setYLayer(area?.yLayer?.toString() ?? '')
        setXStart(area?.xStart?.toString() ?? '')
        setXEnd(area?.xEnd?.toString() ?? '')
        setZStart(area?.zStart?.toString() ?? '')
        setZEnd(area?.zEnd?.toString() ?? '')
    }, [area])

    return (
        <Row>
            <Form.Group controlId={`yLayerForm_${area.uuid}`} as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-warning text-dark'>Y Layer</span></Form.Label>
                <Form.Control
                    type="number"
                    value={yLayer}
                    onChange={(e => setYLayer(e.target.value))}
                    className={isNaN(parseInt(yLayer)) ? 'is-invalid' : ''}
                />
            </Form.Group>

            <Form.Group controlId={`xStartForm_${area.uuid}`} as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-primary text-white'>X Start</span></Form.Label>
                <Form.Control
                    type="number"
                    value={xStart}
                    onChange={(e => setXStart(e.target.value))}
                    className={isNaN(parseInt(xStart)) ? 'is-invalid' : ''}
                />
            </Form.Group>

            <Form.Group controlId={`zStartForm_${area.uuid}`} as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-secondary text-white'>Z Start</span></Form.Label>
                <Form.Control
                    type="number"
                    value={zStart}
                    onChange={(e => setZStart(e.target.value))}
                    className={isNaN(parseInt(zStart)) ? 'is-invalid' : ''}
                />
            </Form.Group>

            <Form.Group controlId={`xEndForm_${area.uuid}`} as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-primary text-white'>X End</span></Form.Label>
                <Form.Control
                    type="number"
                    value={xEnd}
                    onChange={(e => setXEnd(e.target.value))}
                    className={isNaN(parseInt(xEnd)) ? 'is-invalid' : ''}
                />
            </Form.Group>

            <Form.Group controlId={`zEndForm_${area.uuid}`} as={Col} sm="4" md="3" lg="2">
                <Form.Label><span className='badge bg-secondary text-white'>Z End</span></Form.Label>
                <Form.Control
                    type="number"
                    value={zEnd}
                    onChange={(e => setZEnd(e.target.value))}
                    className={isNaN(parseInt(zEnd)) ? 'is-invalid' : ''}
                />
            </Form.Group>

        </Row >
    )
}
