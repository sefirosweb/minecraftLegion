//@ts-nocheck
import { Button, Col, Row } from 'react-bootstrap'
import HarvestArea from './HarvestArea'
import useGetSocket from '@/hooks/useGetSocket';
import useGetSelectedBot from '@/hooks/useGetSelectedBot';

export const FarmerJob = () => {
  const socket = useGetSocket()
  const botConfig = useGetSelectedBot()

  if (botConfig === undefined) { return null }

  const handleInsertNewPlantArea = () => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'insertNewPlantArea'
      }
    })
  }

  const renderPlantAreas = () => {
    return botConfig.config.plantAreas.map((plantArea, index) => {
      return (
        <HarvestArea key={index} id={index} plantArea={plantArea} />
      )
    })
  }

  return (
    <>
      <Row className='mb-3'>
        <Col>
          <h4>Insert areas and type of plant for harvest</h4>
          {renderPlantAreas()}
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col>
          <Button
            variant='success'
            onClick={handleInsertNewPlantArea}
          >
            Insert New Area
          </Button>
        </Col>
      </Row>
    </>
  )
}

// const mapStateToProps = (reducers) => {
//   const { configurationReducer, botsReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer
//   const { botsOnline } = botsReducer

//   return { socket, selectedSocketId, botsOnline }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FarmerJob)
