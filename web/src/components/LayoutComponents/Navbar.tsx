import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ModalAddBot } from './ModalAddBot'
import { Container, Nav, Navbar as BNavbar } from 'react-bootstrap'

export const Navbar: React.FC = () => {

  const [show, setShow] = useState(false)
  return (
    <>
      <BNavbar collapseOnSelect={true} bg="dark" variant="dark" expand="md">
        <Container>
          <BNavbar.Brand as={Link} to="/configuration">Configuration</BNavbar.Brand>
          <BNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" eventKey="dashboard">Dashboard</Nav.Link>
              <Nav.Link onClick={() => setShow(true)}>Load New Bot</Nav.Link>
              <Nav.Link as={Link} to="/masterlist" eventKey="masterlist">Master List</Nav.Link>
              <Nav.Link as={Link} to="/chests" eventKey='chests'>Chests</Nav.Link>
              <Nav.Link as={Link} to="/portals" eventKey='portals'>Portals</Nav.Link>
              <Nav.Link href="https://github.com/sefirosweb/minecraftLegion" rel='noreferrer' target='_blank'>Git</Nav.Link >
            </Nav>
          </BNavbar.Collapse>
        </Container>
      </BNavbar>
      <ModalAddBot show={show} setShow={setShow} />
    </>
  )
}
