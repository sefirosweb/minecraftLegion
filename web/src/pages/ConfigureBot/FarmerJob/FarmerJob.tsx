import React, { useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid';
import { HarvestArea } from './HarvestArea'
import { BotSelectedContext } from "../ConfigurationContext";
import { PlantArea } from 'base-types';

export const FarmerJob: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const handleInsertNewPlantArea = () => {
    const plantAreas = structuredClone(botConfig.plantAreas)
    plantAreas.push({
      uuid: uuidv4(),
      plant: "",
      layer: {
        xEnd: 0,
        xStart: 0,
        yLayer: 0,
        zEnd: 0,
        zStart: 0
      },
    })
    updateConfig('plantAreas', plantAreas)
  }

  const deletePlant = (index: number) => {
    const plantAreas = structuredClone(botConfig.plantAreas)
    plantAreas.splice(index, 1)
    updateConfig('plantAreas', plantAreas)
  }

  const updatePlant = (index: number, plantArea: PlantArea) => {
    const plantAreas = structuredClone(botConfig.plantAreas)
    plantAreas[index] = plantArea
    updateConfig('plantAreas', plantAreas)
  }

  return (
    <>
      <Row className='mb-3'>
        <Col>
          <h4>Insert areas and type of plant for harvest</h4>
          {botConfig.plantAreas.map((plantArea, index) => (
            <HarvestArea
              key={plantArea.uuid}
              plantArea={plantArea}
              updatePlant={(plantArea) => updatePlant(index, plantArea)}
              deletePlant={() => deletePlant(index)}
            />
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
