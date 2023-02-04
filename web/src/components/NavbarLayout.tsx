import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Modal from './Modal'
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap'
import { State } from '@/state'

const NavbarLayout = () => {

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged, socket } = configurationState

  const [show, setShow] = useState(false)
  const [botName, setBotName] = useState('')
  const [botPassword, setBotPassword] = useState('')

  const handleClose = () => {
    setShow(false)
    setBotName('')
    setBotPassword('')
  }

  const handleShow = () => {
    setShow(true)
  }

  const handleAccept = () => {
    connectBot()
  }

  const connectBot = () => {
    const message = {
      botName,
      botPassword
    }

    //@ts-ignore
    socket.emit('botConnect', message)
    handleClose()
  }

  const changeBotName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotName(e.target.value.trim())
  }

  const changeBotPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotPassword(e.target.value)
  }

  const getModalFields = () => {
    return (
      <Row>
        <Col>
          <div className='form-group'>
            <Form>
              <Form.Group>
                <Form.Label>Bot Name</Form.Label>
                <Form.Control type='text' onChange={changeBotName} value={botName} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type='text' onChange={changeBotPassword} value={botPassword} />
                <Form.Text className='text-muted'>
                  No put password on open server when is not requiered
                </Form.Text>
              </Form.Group>
            </Form>
          </div>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <Navbar collapseOnSelect={true} bg="dark" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/configuration">Configuration</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">

              {!loged ? '' :
                <>
                  <Nav.Link as={Link} to="/dashboard" eventKey="dashboard">Dashboard</Nav.Link>
                  <Nav.Link onClick={handleShow}>Load New Bot</Nav.Link>
                  <Nav.Link as={Link} to="/masterlist" eventKey="masterlist">Master List</Nav.Link>
                  <Nav.Link as={Link} to="/chests" eventKey='chests'>Chests</Nav.Link>
                  <Nav.Link as={Link} to="/portals" eventKey='portals'>Portals</Nav.Link>
                </>
              }

              <Nav.Link href="https://github.com/sefirosweb/minecraftLegion" rel='noreferrer' target='_blank'>Git</Nav.Link >
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Modal show={show} handleAccept={handleAccept} handleClose={handleClose} title='Fill the data' body={getModalFields()} />
    </>
  )
}

export default NavbarLayout