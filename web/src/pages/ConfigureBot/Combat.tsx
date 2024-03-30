import React, { useContext } from 'react';
import { Col, Form, Row } from 'react-bootstrap'
import { BotSelectedContext } from "./ConfigurationContext";
import { isAgroType } from 'base-types';

export const Combat: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const handleChangeAgro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isAgroType(value)) return
    updateConfig('mode', value)
  };

  const handleChangeDistance = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      updateConfig('distance', 0)
      return
    }

    const distance = parseInt(e.target.value)
    if (isNaN(distance) || distance < 0) return
    updateConfig('distance', distance)
  }

  return (
    <>
      <Row>
        <Col xs={12} md={6} className='mb-3'>
          <Form>
            <Form.Label>Combat Mode?</Form.Label>
            {['none', 'pve', 'pvp'].map((option) => (
              <Form.Check
                className="text-uppercase"
                id={`${option}`}
                key={`${option}`}
                value={option}
                label={option}
                type="radio"
                onChange={handleChangeAgro}
                checked={botConfig.mode === option}
              />
            ))}
          </Form>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Combat Distance</Form.Label>
            <Form.Control
              type='number'
              onChange={handleChangeDistance}
              value={botConfig.distance}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  )
}
