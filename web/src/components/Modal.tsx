import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

type Props = {
  show: boolean,
  handleClose: () => void
  handleAccept: () => void
  title: string
  body: JSX.Element
}

const ModalDialog = (props: Props) => {
  const { body, show, handleClose, handleAccept, title } = props

  const renderTitle = (titleModal: string) => {
    return (
      <Modal.Header>
        <Modal.Title>{titleModal}</Modal.Title>
      </Modal.Header>
    )
  }

  return (
    <Modal show={show} onHide={handleClose}>

      {title ? renderTitle(title) : ''}

      <Modal.Body>
        {body}

      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleAccept}>
          Accept
        </Button>
      </Modal.Footer>

    </Modal>
  )
}

export default ModalDialog
