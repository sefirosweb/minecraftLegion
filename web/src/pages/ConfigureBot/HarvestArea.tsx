//@ts-nocheck
import { Col, Row } from 'react-bootstrap'
import ItemsAviable from './ItemsAviable'
import { useChangeConfig } from '@/hooks/useChangeConfig'
import { LayerCoords } from '@/components'

const HarvestArea = (props) => {
  const { id, plantArea } = props

  const changeConfig = useChangeConfig()

  const handleChange = (event, type) => {
    const copyPlant = { ...plantArea }
    copyPlant[type] = event.target.value

    changeConfig('changePlantArea', {
      id,
      plantArea: copyPlant
    })
  }

  const handleDeletePlantArea = () => {
    changeConfig('deletePlantArea', id)
  }

  return (
    <div className='p-3 mb-3 border rounded'>
      <Row className='mb-3'>

        <Col md={6}>
          <div className='form-group'>
            <label htmlFor='inputItem'>Select Plant</label>
            <input className='form-control' type='text' list={id} value={plantArea.plant ? plantArea.plant : ''} onChange={(e) => handleChange(e, 'plant')} />
            <datalist id={id}>
              <ItemsAviable item={plantArea.plant ? plantArea.plant : ''} type='plants' />
            </datalist>
          </div>
        </Col>
        <Col md={{ span: 3, offset: 3 }}>
          <button className='btn btn-danger form-control' onClick={handleDeletePlantArea}>Delete Area</button>
        </Col>

      </Row>

      <LayerCoords
        area={plantArea}
        onChange={handleChange}
      />

    </div>

  )
}

export default HarvestArea
