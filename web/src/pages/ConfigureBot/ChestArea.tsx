//@ts-nocheck
import { useChangeConfig } from '@/hooks/useChangeConfig';
import { Col, Row } from 'react-bootstrap'

const ChestArea = (props) => {
  const { chestArea, id } = props
  const changeConfig = useChangeConfig()

  const handleChange = (type, event) => {
    const copyChest = { ...chestArea }
    copyChest[type] = event.target.value

    changeConfig('changeChestArea', {
      id,
      chestArea: copyChest
    })
  }

  const handleDeleteChestArea = (event) => {
    changeConfig('deleteChestArea', id)
  }

  return (
    <div className='p-3 mb-3 border rounded'>
      <Row>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-primary text-white'>X Start</span></label>
            <input className='form-control' type='text' value={chestArea.xStart} onChange={handleChange.bind(props, 'xStart')} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-warning text-dark'>Y Layer</span></label>
            <input className='form-control' type='text' value={chestArea.yLayer} onChange={handleChange.bind(props, 'yLayer')} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-secondary text-white'>Z Start</span></label>
            <input className='form-control' type='text' value={chestArea.zStart} onChange={handleChange.bind(props, 'zStart')} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-primary text-white'>X End</span></label>
            <input className='form-control' type='text' value={chestArea.xEnd} onChange={handleChange.bind(props, 'xEnd')} />
          </div>
        </Col>

        <Col xs={2}>
          <div className='form-group'>
            <label htmlFor='inputItem'><span className='badge bg-secondary text-white'>Z End</span></label>
            <input className='form-control' type='text' value={chestArea.zEnd} onChange={handleChange.bind(props, 'zEnd')} />
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


export default ChestArea
