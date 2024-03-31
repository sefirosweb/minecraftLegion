import { Button, Col, Form, Row } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid';
import { FarmArea } from './FarmArea'
import { BotSelectedContext } from "../ConfigurationContext";
import React, { useContext } from 'react';
import { Config, Layer, AnimalList } from 'base-types';
import { FormNumeric } from '@/components';

export const BreederJob: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const handleInsertNewFarmArea = () => {

    const newFarmAreas = structuredClone(botConfig.farmAreas)
    newFarmAreas.push({
      uuid: uuidv4(),
      yLayer: 0,
      xStart: 0,
      xEnd: 0,
      zStart: 0,
      zEnd: 0
    })

    updateConfig('farmAreas', newFarmAreas)
  }

  const handleUpdateAnimal = <K extends keyof Config["farmAnimal"]>(avnimal: K, value: Config["farmAnimal"][K]) => {
    const newFarmAnimal = structuredClone(botConfig.farmAnimal)
    newFarmAnimal[avnimal] = value
    updateConfig('farmAnimal', newFarmAnimal)
  }

  const handleUpdateSeconds = (value: number) => {
    updateConfig('farmAnimalSeconds', value)
  }

  const updateFarmArea = (index: number, area: Layer) => {
    const newFarmAreas = structuredClone(botConfig.farmAreas)
    newFarmAreas[index] = area
    updateConfig('farmAreas', newFarmAreas)
  }

  const deleteFarmArea = (index: number) => {
    const newFarmAreas = structuredClone(botConfig.farmAreas)
    newFarmAreas.splice(index, 1)
    updateConfig('farmAreas', newFarmAreas)
  }

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Animal max by area</h4>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={6} md={4} lg={3} xl={2}>
          <Form.Group controlId="validationFeedSeconds">
            <Form.Label>Feed every seconds</Form.Label>
            <FormNumeric
              value={botConfig.farmAnimalSeconds}
              onChange={handleUpdateSeconds}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        {Object.values(AnimalList).map((animal) => (
          <Col key={animal} sm={6} md={4} lg={3} xl={2}>
            <Form.Group controlId={`validationFeed${animal}`}>
              <Form.Label className='text-capitalize'>{animal}</Form.Label>
              <FormNumeric
                value={botConfig.farmAnimal[animal]}
                onChange={(newValue) => handleUpdateAnimal(animal, newValue)}
              />
            </Form.Group>
          </Col>
        ))}
      </Row >

      <h4>Insert new farm area</h4>
      {botConfig.farmAreas.map((farmArea, index) => (
        <FarmArea
          key={farmArea.uuid}
          farmArea={farmArea}
          updateFarmArea={(area) => updateFarmArea(index, area)}
          deleteFarmArea={() => deleteFarmArea(index)}
        />
      ))}

      <Button variant='success' onClick={handleInsertNewFarmArea}>Insert New Farm Area</Button>
    </>
  )
}
