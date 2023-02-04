//@ts-nocheck
import { Col, Form, Row } from 'react-bootstrap'
import FarmArea from './FarmArea'
import { useSelector } from "react-redux";
import { State } from '@/state';

const BreederJob = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const botConfig = botsOnline.find((e) => { return e.socketId === selectedSocketId })
  if (botConfig === undefined) { return null }

  const handleInsertNewFarmArea = () => {
    if (socket) {
      socket.emit('sendAction', {
        action: 'changeConfig',
        socketId: botConfig.socketId,
        value: {
          configToChange: 'insertNewFarmArea'
        }
      })
    }
  }

  const handleUpdateAnimal = (animal, event) => {
    const value = event.target.value
    console.log(value)
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: selectedSocketId,
      value: {
        configToChange: 'changeAnimalValue',
        value: {
          id: id,
          animal,
          value
        }
      }
    })
  }

  const renderFarmArea = () => {
    return botConfig.config.farmAreas.map((farmArea, index) => {
      return (
        <FarmArea key={index} id={index} farmArea={farmArea} />
      )
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
            value={botConfig.config.farmAnimal.seconds}
            onChange={(e) => handleUpdateAnimal('seconds', e)}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomCow">
          <Form.Label>Cow</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.cow}
            onChange={(e) => handleUpdateAnimal('cow', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomSheep">
          <Form.Label>Sheep</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.sheep}
            onChange={(e) => handleUpdateAnimal('sheep', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomChicken">
          <Form.Label>Chicken</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.chicken}
            onChange={(e) => handleUpdateAnimal('chicken', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2"
          controlId="validationCustomHorse">
          <Form.Label>Horse</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.horse}
            onChange={(e) => handleUpdateAnimal('horse', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2"
          controlId="validationCustomDonkey">
          <Form.Label>Donkey</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.donkey}
            onChange={(e) => handleUpdateAnimal('donkey', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomLlama">
          <Form.Label>Llama</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.llama}
            onChange={(e) => handleUpdateAnimal('llama', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomFox">
          <Form.Label>Fox</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.fox}
            onChange={(e) => handleUpdateAnimal('fox', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomBee">
          <Form.Label>Bee</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.bee}
            onChange={(e) => handleUpdateAnimal('bee', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomPanda">
          <Form.Label>Panda</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.panda}
            onChange={(e) => handleUpdateAnimal('panda', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomWolf">
          <Form.Label>Wolf</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.wolf}
            onChange={(e) => handleUpdateAnimal('wolf', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomCat">
          <Form.Label>Cat</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.cat}
            onChange={(e) => handleUpdateAnimal('cat', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomRabbit">
          <Form.Label>Rabbit</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.rabbit}
            onChange={(e) => handleUpdateAnimal('rabbit', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomPig">
          <Form.Label>Pig</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.pig}
            onChange={(e) => handleUpdateAnimal('pig', e)}
          />
        </Form.Group>

        <Form.Group as={Col} sm="4" md="3" lg="2" controlId="validationCustomTurtle">
          <Form.Label>Turtle</Form.Label>
          <Form.Control
            type="text"
            value={botConfig.config.farmAnimal.turtle}
            onChange={(e) => handleUpdateAnimal('turtle', e)}
          />
        </Form.Group>

      </Row >

      <Row className="mb-3">
        <Col>
          <h4>Insert new farm area</h4>
          {renderFarmArea()}
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

export default BreederJob

// const mapStateToProps = (reducers) => {
//   const { configurationReducer, botsReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer
//   const { botsOnline } = botsReducer

//   return { socket, selectedSocketId, botsOnline }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(BreederJob)
