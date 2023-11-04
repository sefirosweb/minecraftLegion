import { useChangeConfig } from '@/hooks/useChangeConfig';
import { Layer } from 'base-types';
import React from 'react';
import { Col, Row } from 'react-bootstrap'

type Props = {
  chestArea: Layer
  id: number
}

export const ChestArea: React.FC<Props> = (props) => {
  const { chestArea, id } = props
  const changeConfig = useChangeConfig()

  const handleChange = (type: keyof Layer, value: string) => {
    const copyChest = { ...chestArea }
    copyChest[type] = parseInt(value)

    changeConfig('changeChestArea', {
      id,
      chestArea: copyChest
    })
  }

  const handleDeleteChestArea = () => {
    changeConfig('deleteChestArea', id)
  }

  return (
    <div className='p-3 mb-3 border rounded'>
      <Row>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-primary text-white'>X Start</span></label>
            <input className='form-control' type='text' value={chestArea.xStart} onChange={(e) => handleChange('xStart', e.target.value)} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-warning text-dark'>Y Layer</span></label>
            <input className='form-control' type='text' value={chestArea.yLayer} onChange={(e) => handleChange('yLayer', e.target.value)} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-secondary text-white'>Z Start</span></label>
            <input className='form-control' type='text' value={chestArea.zStart} onChange={(e) => handleChange('zStart', e.target.value)} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-primary text-white'>X End</span></label>
            <input className='form-control' type='text' value={chestArea.xEnd} onChange={(e) => handleChange('xEnd', e.target.value)} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-secondary text-white'>Z End</span></label>
            <input className='form-control' type='text' value={chestArea.zEnd} onChange={(e) => handleChange('zEnd', e.target.value)} />
          </div>
        </Col>

      </Row>

      <Row className='mt-2'>
        <Col xs={3}>
          <button className='btn btn-danger form-control' onClick={handleDeleteChestArea}>Delete Area</button>
        </Col>
      </Row>
    </div >

  )
}
