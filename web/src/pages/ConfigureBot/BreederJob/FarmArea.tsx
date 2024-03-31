import { Button, Col, Row } from 'react-bootstrap'
import { LayerCoords } from '@/components'
import React from 'react'
import { Layer } from 'base-types'

type Props = {
  farmArea: Layer
  updateFarmArea: (area: Layer) => void
  deleteFarmArea: () => void
}

export const FarmArea: React.FC<Props> = (props) => {
  const { farmArea, updateFarmArea, deleteFarmArea } = props

  return (
    <div className='p-3 mb-3 border rounded'>
      <LayerCoords
        area={farmArea}
        onChange={updateFarmArea}
      />

      <Row className='mt-3'>
        <Col>
          <Button variant='danger' onClick={deleteFarmArea}>
            Delete Area
          </Button>
        </Col>
      </Row>
    </div >
  )
}

