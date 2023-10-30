//@ts-nocheck
import { Button, Col, Row } from 'react-bootstrap'
import HarvestArea from './HarvestArea'
import { BotSelectedContext } from "./ConfigurationContext";
import { useContext } from 'react';
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const FarmerJob = () => {
  const botConfig = useContext(BotSelectedContext);
  const changeConfig = useChangeConfig()

  const handleInsertNewPlantArea = () => {
    changeConfig('insertNewPlantArea', '')
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
