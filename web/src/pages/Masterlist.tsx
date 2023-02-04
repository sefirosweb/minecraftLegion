import useGetSocket from '@/hooks/useGetSocket';
import { State } from '@/state';
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Socket } from 'socket.io-client';

const Masterlist = () => {

  const socket = useGetSocket() as Socket
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { master } = configurationState

  const botState = useSelector((state: State) => state.botsReducer);
  const { masters } = botState

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
    return masters.map((masterIndex, index) => {
      return (
        <li
          onClick={() => handleRemoveMaster(masterIndex.name)}
          style={{ cursor: "pointer" }}
          key={index}
          className={`list-group-item list-group-item-action
           ${(masterIndex.name === master) ? 'active' : ''}`}
        >
          {masterIndex.name}
        </li>
      )
    }, master)
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'><h1>Master List</h1></div>
      </div>
      <div className='row'>
        <div className='col-12'>
          <div className='form-group'>
            <input type='text' placeholder='Add new master' className='form-control' onKeyDown={handleKeyDown} onChange={handleInputBox} value={inputBox} />
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-12'>
          <ul className='list-group'>
            {renderMasterList()}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Masterlist