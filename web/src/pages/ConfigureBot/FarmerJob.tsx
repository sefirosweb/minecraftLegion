import React, { useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap'
import { HarvestArea } from './HarvestArea'
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const FarmerJob: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);
  const changeConfig = useChangeConfig()

  const handleInsertNewPlantArea = () => {
    changeConfig('insertNewPlantArea', '')
  }

  return (
    <>
      <Row className='mb-3'>
        <Col>
          <h4>Insert areas and type of plant for harvest</h4>
          {botConfig.config.plantAreas.map((plantArea, index) => (
            <HarvestArea key={index} id={index} plantArea={plantArea} />
          ))}
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
