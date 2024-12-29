import React, { useContext, useId } from 'react';
import { Config, MineCords, isCoordinates, isMineCoords, isWorld, istunnel } from 'base-types';
import { Col, Form, Row } from 'react-bootstrap'
import HouseXYZ from '@/images/HouseXYZ.png'
import { BotSelectedContext } from "./ConfigurationContext";

export const MinerJob: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const changeMinerConfig = <K extends keyof Config['minerCords']>(configToChange: K, value: Config['minerCords'][K]) => {
    const newMinerCords = botConfig.minerCords
    newMinerCords[configToChange] = value
    updateConfig('minerCords', newMinerCords)
  }

  const handleChangeTunnel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!istunnel(e.target.value)) return
    changeMinerConfig('tunnel', e.target.value)
  }

  const handleChangeWorld = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isWorld(e.target.value)) return
    changeMinerConfig('world', e.target.value)
  }

  const handleChangeOrientation = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isCoordinates(e.target.value)) return
    changeMinerConfig('orientation', e.target.value)
  }

  const handleReverseMode = (mode: boolean) => {
    changeMinerConfig('reverse', mode)
  }

  const updateChangePosMiner = <K extends keyof MineCords>(configToChange: K, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const pos = Number(e.target.value)

    if (!Number.isInteger(pos) && e.target.value !== '-') {
      return null
    }

    if (!isMineCoords(configToChange)) return
    changeMinerConfig(configToChange, pos)
  }

  return (
    <>
      <div className='mb-3'>
        Depending the tunnel type and orientation have a different behavior
      </div>

      <Row>
        <Col xs={12} md={6} className='mb-3'>
          <Form>
            <Form.Label>Tunnel type?</Form.Label>
            {['vertically', 'horizontally'].map((option) => (
              <Form.Check
                className="text-capitalize"
                id={`${option}`}
                key={`${option}`}
                value={option}
                label={option}
                type="radio"
                onChange={handleChangeTunnel}
                checked={botConfig.minerCords.tunnel === option}
              />
            ))}
          </Form>
        </Col>

        <Col xs={12} md={6} className='mb-3'>
          <Form>
            <Form.Label>Tunnel type?</Form.Label>
            {['x+', 'x-', 'z+', 'z-'].map((option) => (
              <Form.Check
                className="text-capitalize"
                id={`${option}`}
                key={`${option}`}
                value={option}
                label={option}
                type="radio"
                onChange={handleChangeOrientation}
                checked={botConfig.minerCords.orientation === option}
              />
            ))}
          </Form>
        </Col>
      </Row>

      <Row>
        <Col md={6} className='mb-3'>
          <Form.Check
            type='switch'
            id="reverseMode"
            label="Reverse Mode?"
            checked={botConfig.minerCords.reverse}
            onChange={() => handleReverseMode(!botConfig.minerCords.reverse)}
          />
        </Col>

        <Col md={6} className='mb-3'>
          <Form>
            <Form.Label>World?</Form.Label>
            {['overworld', 'the_nether', 'the_end'].map((option) => (
              <Form.Check
                className="text-capitalize"
                id={`${option}`}
                key={`${option}`}
                value={option}
                label={option}
                type="radio"
                onChange={handleChangeWorld}
                checked={botConfig.minerCords.world === option}
              />
            ))}
          </Form>
        </Col>
      </Row>


      <div className='p-3 mb-3 border rounded'>
        <h5>Start Coords</h5>
        <Row>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-primary text-white'>X Start</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.xStart}
              onChange={(e) => updateChangePosMiner('xStart', e)}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-warning text-dark'>Y Start</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.yStart}
              onChange={(e) => updateChangePosMiner('yStart', e)}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-secondary text-white'>Z Start</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.zStart}
              onChange={(e) => updateChangePosMiner('zStart', e)}
            />
          </Form.Group>
        </Row >
      </div >

      <div className='p-3 mb-3 border rounded'>
        <h5>End Coords</h5>
        <Row>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-primary text-white'>X End</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.xEnd}
              onChange={(e) => updateChangePosMiner('xEnd', e)}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-warning text-dark'>Y End</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.yEnd}
              onChange={(e) => updateChangePosMiner('yEnd', e)}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId={useId()}>
            <Form.Label><span className='badge bg-secondary text-white'>Z End</span></Form.Label>
            <Form.Control
              type="number"
              value={botConfig.minerCords.zEnd}
              onChange={(e) => updateChangePosMiner('zEnd', e)}
            />
          </Form.Group>
        </Row >
      </div >

      <Row className='mb-5'>
        <Col>
          <label>
            <img src={HouseXYZ} width='100%' alt='House_XYZ' />
          </label>
        </Col>
      </Row>
    </>
  )
}
