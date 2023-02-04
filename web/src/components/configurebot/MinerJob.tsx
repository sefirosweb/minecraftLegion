//@ts-nocheck
import { Col, Form, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import FormCheck from "../forms/FormCheck";
import HouseXYZ from '../../images/HouseXYZ.png'
import { State } from '@/state';

const MinerJob = () => {

  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState


  const botConfig = botsOnline.find((e) => { return e.socketId === selectedSocketId })
  if (botConfig === undefined) { return null }

  const handleChangeTunnel = (event) => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'changeTunnel',
        value: event.target.value
      }
    })
  }

  const handleChangeWorld = (event) => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'changeWorldMiner',
        value: event.target.value
      }
    })
  }

  const handleChangeOrientation = (event) => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'changeOrientation',
        value: event.target.value
      }
    })
  }

  const handleReverseMode = (mode) => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'changeReverseModeMiner',
        value: mode
      }
    })
  }

  const handleChangePosMiner = (event) => {
    const pos = Number(event.target.value)

    if (!Number.isInteger(pos) && event.target.value !== '-') {
      return null
    }

    const coord = event.target.id
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'changePosMiner',
        value: {
          coord,
          pos: event.target.value
        }
      }
    })
  }

  return (
    <>

      <Row className='mb-3'>
        <Col>
          <label>
            Depending the tunnel type and orientation have a different behavior
          </label>
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col md={6}>
          <Form>
            <Form.Group as={Row}>
              <Col md={3}>
                Tunel type?
              </Col>
              <Col md={9}>
                <Form.Check
                  type='radio'
                  id={`handleChangeTunnel`}
                  label={`Make a Hole`}
                  value='vertically'
                  onChange={handleChangeTunnel}
                  checked={botConfig.config.minerCords.tunel === 'vertically'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeTunnel`}
                  label={`Make a Tunel`}
                  value='horizontally'
                  onChange={handleChangeTunnel}
                  checked={botConfig.config.minerCords.tunel === 'horizontally'}
                />
              </Col>
            </Form.Group>
          </Form>
        </Col>
        <Col md={6}>

          <Form>
            <Form.Group as={Row}>
              <Col md={3}>
                Orientation?
              </Col>
              <Col md={9}>
                <Form.Check
                  type='radio'
                  id={`handleChangeOrientation`}
                  label={`X+`}
                  value='x+'
                  onChange={handleChangeOrientation}
                  checked={botConfig.config.minerCords.orientation === 'x+'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeOrientation`}
                  label={`X-`}
                  value='x-'
                  onChange={handleChangeOrientation}
                  checked={botConfig.config.minerCords.orientation === 'x-'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeOrientation`}
                  label={`Z+`}
                  value='z+'
                  onChange={handleChangeOrientation}
                  checked={botConfig.config.minerCords.orientation === 'z+'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeOrientation`}
                  label={`Z-`}
                  value='z-'
                  onChange={handleChangeOrientation}
                  checked={botConfig.config.minerCords.orientation === 'z-'}
                />
              </Col>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col md={6}>
          <FormCheck
            id={"reverseMode"}
            onChange={() =>
              handleReverseMode(!botConfig.config.minerCords.reverse)
            }
            label={`Reverse Mode?`}
            checked={botConfig.config.minerCords.reverse}
          />
        </Col>
        <Col md={6}>
          <Form>
            <Form.Group as={Row}>
              <Col md={3}>
                World?
              </Col>
              <Col md={9}>
                <Form.Check
                  type='radio'
                  id={`handleChangeWorld`}
                  label={`Overworld`}
                  value='minecraft:overworld'
                  onChange={handleChangeWorld}
                  checked={botConfig.config.minerCords.world === 'minecraft:overworld'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeWorld`}
                  label={`Nether`}
                  value='minecraft:the_nether'
                  onChange={handleChangeWorld}
                  checked={botConfig.config.minerCords.world === 'minecraft:the_nether'}
                />
                <Form.Check
                  type='radio'
                  id={`handleChangeWorld`}
                  label={`End`}
                  value='minecraft:the_end'
                  onChange={handleChangeWorld}
                  checked={botConfig.config.minerCords.world === 'minecraft:the_end'}
                />
              </Col>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <div className='p-3 mb-3 border rounded'>
        <h5>Start Coords</h5>
        <Row>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="xStart">
            <Form.Label><span className='badge bg-primary text-white'>X Start</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.xStart}
              onChange={handleChangePosMiner}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="yStart">
            <Form.Label><span className='badge bg-warning text-dark'>Y Start</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.yStart}
              onChange={handleChangePosMiner}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="zStart">
            <Form.Label><span className='badge bg-secondary text-white'>Z Start</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.zStart}
              onChange={handleChangePosMiner}
            />
          </Form.Group>
        </Row >
      </div >

      <div className='p-3 mb-3 border rounded'>
        <h5>End Coords</h5>
        <Row>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="xEnd">
            <Form.Label><span className='badge bg-primary text-white'>X End</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.xEnd}
              onChange={handleChangePosMiner}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="yEnd">
            <Form.Label><span className='badge bg-warning text-dark'>Y End</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.yEnd}
              onChange={handleChangePosMiner}
            />
          </Form.Group>

          <Form.Group as={Col} sm="4" md="3" lg="2" controlId="zEnd">
            <Form.Label><span className='badge bg-secondary text-white'>Z End</span></Form.Label>
            <Form.Control
              type="text"
              value={botConfig.config.minerCords.zEnd}
              onChange={handleChangePosMiner}
            />
          </Form.Group>
        </Row >
      </div >

      <Row className='mb-5'>
        <Col>
          <label>
            <img src={HouseXYZ} width='100%' alt='House_XYZ' />
          </label>
        </Col>
      </Row>
    </>
  )
}

export default MinerJob

// const mapStateToProps = (reducers) => {
//   const { botsReducer, configurationReducer } = reducers
//   const { botsOnline } = botsReducer
//   const { socket, selectedSocketId } = configurationReducer

//   return { botsOnline, socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(MinerJob)
