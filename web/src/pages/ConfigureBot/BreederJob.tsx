import { Col, Form, Row } from 'react-bootstrap'
import { FarmArea } from './FarmArea'
import { BotSelectedContext } from "./ConfigurationContext";
import React, { useContext } from 'react';
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const BreederJob: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);
  const changeConfig = useChangeConfig()

  const handleInsertNewFarmArea = () => {
    changeConfig('insertNewFarmArea', '')
  }

  const handleUpdateAnimal = (animal: string, value: string) => {
    changeConfig('changeAnimalValue', {
      animal,
      value
    })
  }

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Animal max by area</h4>
        </Col>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} sm="12" md="6" lg="4" controlId="validationCustomFeed">
          <Form.Label>Feed every seconds</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimalSeconds}
            onChange={(e) => handleUpdateAnimal('seconds', e.target.value)}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomCow">
          <Form.Label>Cow</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.cow}
            onChange={(e) => handleUpdateAnimal('cow', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomSheep">
          <Form.Label>Sheep</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.sheep}
            onChange={(e) => handleUpdateAnimal('sheep', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomChicken">
          <Form.Label>Chicken</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.chicken}
            onChange={(e) => handleUpdateAnimal('chicken', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2"
          controlId="validationCustomHorse">
          <Form.Label>Horse</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.horse}
            onChange={(e) => handleUpdateAnimal('horse', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2"
          controlId="validationCustomDonkey">
          <Form.Label>Donkey</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.donkey}
            onChange={(e) => handleUpdateAnimal('donkey', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomLlama">
          <Form.Label>Llama</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.llama}
            onChange={(e) => handleUpdateAnimal('llama', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomFox">
          <Form.Label>Fox</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.fox}
            onChange={(e) => handleUpdateAnimal('fox', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomBee">
          <Form.Label>Bee</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.bee}
            onChange={(e) => handleUpdateAnimal('bee', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomPanda">
          <Form.Label>Panda</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.panda}
            onChange={(e) => handleUpdateAnimal('panda', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomWolf">
          <Form.Label>Wolf</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.wolf}
            onChange={(e) => handleUpdateAnimal('wolf', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomCat">
          <Form.Label>Cat</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.cat}
            onChange={(e) => handleUpdateAnimal('cat', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomRabbit">
          <Form.Label>Rabbit</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.rabbit}
            onChange={(e) => handleUpdateAnimal('rabbit', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomPig">
          <Form.Label>Pig</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.pig}
            onChange={(e) => handleUpdateAnimal('pig', e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomTurtle">
          <Form.Label>Turtle</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.turtle}
            onChange={(e) => handleUpdateAnimal('turtle', e.target.value)}
          />
        </Form.Group>

      </Row >

      <Row className="mb-3">
        <Col>
          <h4>Insert new farm area</h4>
          {botConfig.config.farmAreas.map((farmArea, index) => (
            <FarmArea key={index} id={index} farmArea={farmArea} />
          ))}
        </Col>
      </Row>


      <Row className='mb-5'>
        <Col>
          <button type='button' className='btn btn-success' onClick={handleInsertNewFarmArea}>Insert New Farm Area</button>
        </Col>
      </Row>

    </>
  )
}
