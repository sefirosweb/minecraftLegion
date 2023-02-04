//@ts-nocheck
import { State } from '@/state'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import LayerCoords from '../forms/LayerCoords'

type Props = {
  id: number,
  farmArea: string
}

const FarmArea = (props: Props) => {

  const { farmArea, id } = props

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState


  const handleChange = (event, type) => {
    const copyFarm = { ...farmArea }
    copyFarm[type] = event.target.value

    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: selectedSocketId,
      value: {
        configToChange: 'changeFarmArea',
        value: {
          id: id,
          farmArea: copyFarm
        }
      }
    })
  }

  const handleDeleteFarmArea = () => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: selectedSocketId,
      value: {
        configToChange: 'deleteFarmArea',
        value: id
      }
    })
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

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer
//   return { socket, selectedSocketId }
// }

// export default connect(mapStateToProps, null)(FarmArea)
