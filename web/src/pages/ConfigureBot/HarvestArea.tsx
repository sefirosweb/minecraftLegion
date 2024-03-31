import React, { useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { Layer, PlantArea } from 'base-types'
import { ItemWithImageOption, LayerCoords, SingleValueWithImage } from '@/components'
import AsyncSelect from 'react-select/async';
import { ItemOption, plantOptions } from '@/lib'

type Props = {
  plantArea: PlantArea,
  deletePlant: () => void
  updatePlant: (plantArea: PlantArea) => void
}

export const HarvestArea: React.FC<Props> = (props) => {
  const { plantArea, updatePlant, deletePlant } = props
  const [itemName, setItemName] = useState<ItemOption | null>(null);

  const handleChangeCoords = (area: Layer) => {
    const newPlant = structuredClone(plantArea)
    newPlant.layer = area
    updatePlant(newPlant)
  }

  const handleChangePlant = (itemOption: ItemOption) => {
    const newPlant = structuredClone(plantArea)
    newPlant.plant = itemOption?.value?.name ?? ''
    updatePlant(newPlant)
    setItemName(itemOption)
  }

  return (
    <div className='p-3 mb-3 border rounded'>

      <Row className='d-flex align-items-end'>
        <Col lg={8} className='mb-3'>
          <label htmlFor='inputItem'>Select Plant</label>

          <AsyncSelect
            defaultOptions
            components={{
              Option: ItemWithImageOption,
              SingleValue: SingleValueWithImage,
            }}
            isMulti={false}
            loadOptions={plantOptions}
            value={itemName}
            getOptionLabel={(option) => option.label}
            onChange={(e) => handleChangePlant(e as ItemOption)} />

        </Col>

        <Col lg={4} className='mb-3'>
          <Button variant='danger' onClick={deletePlant}>Delete Area</Button>
        </Col>
      </Row>

      <LayerCoords
        area={plantArea.layer}
        onChange={handleChangeCoords}
      />

    </div>

  )
}
