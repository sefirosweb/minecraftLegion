import { useGetSocket } from '@/hooks/useGetSocket';
import { useStore } from '@/hooks/useStore';
import React, { useState } from 'react'
import { Form } from 'react-bootstrap';
import { Socket } from 'socket.io-client';

export const Masterlist: React.FC = () => {
  const socket = useGetSocket() as Socket
  const master = useStore(state => state.master)

  const setMaster = useStore(state => state.setMaster)
  const masters = useStore(state => state.masters)

  const handleChangeMaster = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaster(event.target.value)
  }

  const [inputBox, setInputBox] = useState('')

  const handleInputBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputBox(event.target.value.trim())
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && inputBox !== '') {
      handleSendMessageButton()
    }
  }

  const handleSendMessageButton = () => {
    socket.emit('sendAction', {
      action: 'addMaster',
      value: inputBox
    })
    setInputBox('')
  }

  const handleRemoveMaster = (masterToDelete: string) => {
    if (masterToDelete === master) return
    socket.emit('sendAction', {
      action: 'removeMaster',
      value: masterToDelete
    })
  }

  return (
    <>
      <div className='mb-3'>
        <Form.Group controlId="handleChangeMaster">
          <Form.Label className='fw-bolder fs-4'>Your name in game</Form.Label>
          <Form.Control type="text" value={master} onChange={handleChangeMaster} />
        </Form.Group>
      </div>


      <div className='mb-2'>
        <Form.Group controlId="handleChangeMaster">
          <Form.Label className='fw-bolder fs-4'>Master List</Form.Label>
          <Form.Control type="text" value={inputBox} onChange={handleInputBox} onKeyDown={handleKeyDown} placeholder='Add new master' />
        </Form.Group>
      </div>

      <div>
        <ul className='list-group'>
          {masters.map((name, index) => (
            <li
              onClick={() => handleRemoveMaster(name)}
              style={{ cursor: "pointer" }}
              key={index}
              className={`list-group-item list-group-item-action
                 ${(name === master) ? 'active' : ''}`}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
