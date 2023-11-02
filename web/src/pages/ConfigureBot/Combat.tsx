//@ts-nocheck
import React, { useContext } from 'react';
import { Col, Row } from 'react-bootstrap'
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const Combat: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);

  const changeConfig = useChangeConfig()

  const handleChangeMode = (event) => {
    changeConfig('mode', event.target.value)
  }

  const handleChangeDistance = (event) => {
    const distance = Number(event.target.value)
    if (Number.isInteger(distance)) {
      changeConfig('distance', distance)
    }
  }

  return (
    <>
      <Row className='mb-5'>
        <Col xs={6}>
          <form>


            <fieldset className='form-group row'>
              <legend className='col-form-label col-sm-4 float-sm-left pt-0'>Combat Mode?</legend>
              <Col xs={8}>
                <div className='form-check'>
                  <input className='form-check-input' type='radio' name='combatMode' value='none' onChange={handleChangeMode} checked={botConfig.config.mode === 'none'} />
                  <label className='form-check-label'>None</label>
                </div>
                <div className='form-check'>
                  <input className='form-check-input' type='radio' name='combatMode' value='pve' onChange={handleChangeMode} checked={botConfig.config.mode === 'pve'} />
                  <label className='form-check-label'>PVE</label>
                </div>
                <div className='form-check'>
                  <input className='form-check-input' type='radio' name='combatMode' value='pvp' onChange={handleChangeMode} checked={botConfig.config.mode === 'pvp'} />
                  <label className='form-check-label'>PVP</label>
                </div>

              </Col>
            </fieldset>

          </form>
        </Col>
        <Col xs={3}>
          <div className='form-group'>
            <label>Distance for start combat?</label>
            <input className='form-control' type='text' onChange={handleChangeDistance} value={botConfig.config.distance} />
          </div>
        </Col>
      </Row>
    </>
  )
}
