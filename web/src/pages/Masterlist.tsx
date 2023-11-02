import { useGetMaster } from '@/hooks/useGetMaster';
import useGetSocket from '@/hooks/useGetSocket';
import { useSendActionSocket } from '@/hooks/useSendActionSocket';
import { State, actionCreators } from '@/state';
import React, { useState } from 'react'
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Socket } from 'socket.io-client';

export const Masterlist: React.FC = () => {
  const socket = useGetSocket() as Socket
  const master = useGetMaster()

  const botState = useSelector((state: State) => state.botsReducer);
  const { masters } = botState

  const sendAction = useSendActionSocket()

  const dispatch = useDispatch();
  const { updateMaster, } = bindActionCreators(actionCreators, dispatch);

  const handleChangeMaster = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMaster(event.target.value)
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

  const renderMasterList = () => {
    return masters.map((name, index) => {
      return (
        <li
          onClick={() => handleRemoveMaster(name)}
          style={{ cursor: "pointer" }}
          key={index}
          className={`list-group-item list-group-item-action
           ${(name === master) ? 'active' : ''}`}
        >
          {name}
        </li>
      )
    }, master)
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
          {renderMasterList()}
        </ul>
      </div>
    </>
  )
}
