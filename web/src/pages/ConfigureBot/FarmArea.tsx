//@ts-nocheck
import { State } from '@/state'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useChangeConfig } from '@/hooks/useChangeConfig'
import { LayerCoords } from '@/components'
import React from 'react'

type Props = {
  id: number,
  farmArea: string
}

const FarmArea: React.FC = (props: Props) => {

  const { farmArea, id } = props

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState
  const changeConfig = useChangeConfig()


  const handleChange = (event, type) => {
    const copyFarm = { ...farmArea }
    copyFarm[type] = event.target.value

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

export default FarmArea
