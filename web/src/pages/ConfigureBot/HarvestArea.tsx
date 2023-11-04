import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { Layer, PlantArea } from 'base-types'
import { ItemsAviable } from './ItemsAviable'
import { useChangeConfig } from '@/hooks/useChangeConfig'
import { LayerCoords } from '@/components'

type Props = {
  id: number,
  plantArea: PlantArea
}

export const HarvestArea: React.FC<Props> = (props) => {
  const { id, plantArea } = props

  const changeConfig = useChangeConfig()

  const handleChangePlant = (value: string) => {
    const newPlant = {
      ...structuredClone(plantArea),
      plant: value
    }

    changeConfig('changePlantArea', {
      id,
      plantArea: newPlant
    })
  }

  const handleDeletePlantArea = () => {
    changeConfig('deletePlantArea', id)
  }

  const handleCHangeCoords = (e: React.ChangeEvent<HTMLInputElement>, pos: keyof Layer) => {
    const newPlant = structuredClone(plantArea)
    newPlant.layer[pos] = parseInt(e.target.value)
    changeConfig('changePlantArea', {
      id,
      plantArea: newPlant
    })
  }

  return (
    <div className='p-3 mb-3 border rounded'>
      <Row className='mb-3'>

        <Col md={6}>
          <div className='form-group'>
            <label htmlFor='inputItem'>Select Plant</label>
            <input className='form-control' type='text' list={`${id}_plant_area`} value={plantArea.plant ? plantArea.plant : ''} onChange={(e) => handleChangePlant(e.target.value)} />
            <datalist id={`${id}_plant_area`}>
              <ItemsAviable item={plantArea.plant ? plantArea.plant : ''} type='plants' />
            </datalist>
          </div>
        </Col>
        <Col md={{ span: 3, offset: 3 }}>
          <button className='btn btn-danger form-control' onClick={handleDeletePlantArea}>Delete Area</button>
        </Col>

      </Row>

      <LayerCoords
        area={plantArea.layer}
        onChange={handleCHangeCoords}
      />

    </div>

  )
}
