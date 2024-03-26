import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Col, Form, Row } from 'react-bootstrap'
import { FormEvent, useRef, useState } from 'react'
import { useGetSocket } from '@/hooks/useGetSocket'

type Props = {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModalAddBot: React.FC<Props> = (props) => {
  const { show, setShow } = props
  const inputBotName = useRef<HTMLInputElement>(null)
  const [botName, setBotName] = useState('')
  const [botPassword, setBotPassword] = useState('')
  const socket = useGetSocket()

  const changeBotName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotName(e.target.value.trim())
  }

  const changeBotPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotPassword(e.target.value)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = {
      botName,
      botPassword
    }

    if (!socket) return

    socket.emit('botConnect', message)
    setShow(false)
  }

  const onExit = () => {
    setBotName('')
    setBotPassword('')
  }

  const onEnter = () => {
    inputBotName.current?.focus()
  }

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      onExit={onExit}
      onEnter={onEnter}
      backdrop="static"
      keyboard={true}
    >
      <Form onSubmit={onSubmit}>

        <Modal.Header>
          <Modal.Title>Fill the data</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId='nameBotForm'>
            <Form.Label>Bot Name</Form.Label>
            <Form.Control type='text' onChange={changeBotName} value={botName} ref={inputBotName} />
          </Form.Group>
          <Form.Group controlId='passwordBotForm'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='text' onChange={changeBotPassword} value={botPassword} disabled />
            <Form.Text className='text-muted'>
              No put password on open server when is not requiered. <br />
              <label className='text-danger'>Currently is disabled, must be used enviorement variable password</label>
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShow(false)}>
            Close
          </Button>
          <Button variant='primary' type="submit">
            Accept
          </Button>
        </Modal.Footer>

      </Form>
    </Modal>
  )
}
