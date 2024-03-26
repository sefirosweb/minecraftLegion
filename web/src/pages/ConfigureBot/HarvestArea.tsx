import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Layer, PlantArea } from 'base-types'
import { useChangeConfig } from '@/hooks/useChangeConfig'
import { ItemWithImageOption, LayerCoords, SingleValueWithImage } from '@/components'
import AsyncSelect from 'react-select/async';
import { ItemOption, itemOptions } from '@/lib'

type Props = {
  id: number,
  plantArea: PlantArea
}

export const HarvestArea: React.FC<Props> = (props) => {
  const { id, plantArea } = props
  const [itemName, setItemName] = useState<ItemOption | null>(null);

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

            <AsyncSelect
              defaultOptions
              components={{
                Option: ItemWithImageOption,
                SingleValue: SingleValueWithImage,
              }}
              isMulti={false}
              loadOptions={itemOptions}
              value={itemName}
              getOptionLabel={(option) => option.label}
              onChange={(e) => setItemName(e as ItemOption)} />     
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
