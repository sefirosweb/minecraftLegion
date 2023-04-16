import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ModalAddBot } from './ModalAddBot'
import { Container, Nav, Navbar } from 'react-bootstrap'

export const NavbarLayout = () => {

  const [show, setShow] = useState(false)
  return (
    <>
      <Navbar collapseOnSelect={true} bg="dark" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/configuration">Configuration</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" eventKey="dashboard">Dashboard</Nav.Link>
              <Nav.Link onClick={() => setShow(true)}>Load New Bot</Nav.Link>
              <Nav.Link as={Link} to="/masterlist" eventKey="masterlist">Master List</Nav.Link>
              <Nav.Link as={Link} to="/chests" eventKey='chests'>Chests</Nav.Link>
              <Nav.Link as={Link} to="/portals" eventKey='portals'>Portals</Nav.Link>
              <Nav.Link href="https://github.com/sefirosweb/minecraftLegion" rel='noreferrer' target='_blank'>Git</Nav.Link >
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <ModalAddBot show={show} setShow={setShow} />
    </>
  )
}
