import { Button, Col, Row } from 'react-bootstrap'
import { useChangeConfig } from '@/hooks/useChangeConfig'
import { LayerCoords } from '@/components'
import React from 'react'
import { Layer } from 'base-types'

type Props = {
  id: number
  farmArea: Layer
}

export const FarmArea: React.FC<Props> = (props) => {
  const { farmArea, id } = props
  const changeConfig = useChangeConfig()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, pos: keyof Layer) => {
    const copyFarm = { ...farmArea }
    copyFarm[pos] = parseInt(e.target.value)

    changeConfig('changeFarmArea', {
      id,
      farmArea: copyFarm
    })
  }

  const handleDeleteFarmArea = () => {
    changeConfig('deleteFarmArea', id)
  }

  return (
    <div className='p-3 mb-3 border rounded'>

      <LayerCoords
        area={farmArea}
        onChange={handleChange}
      />

      <Row className='mt-3'>
        <Col>
          <Button variant='danger' onClick={handleDeleteFarmArea}>
            Delete Area
          </Button>
        </Col>
      </Row>
    </div >

  )
}

