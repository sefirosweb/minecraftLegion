//@ts-nocheck
import { useContext, useState } from 'react'
import ItemsAviable from './ItemsAviable'
import TrashIcon from './Icons/Trash'
import useGetSocket from '@/hooks/useGetSocket'
import { BotSelectedContext } from '@/utils/BotSelectedContext'

export const ItemsToBeReady = () => {
  const botConfig = useContext(BotSelectedContext);
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const socket = useGetSocket()

  const handleQuantityChange = (event) => {
    const value = Number(event.target.value)
    if (Number.isInteger(value)) {
      setQuantity(value)
    }
  }

  const handleItemChange = (event) => {
    setItemName(event.target.value)
  }

  const handleInsertItem = () => {
    if (itemName === '' || quantity === 0) {
      return null
    }

    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'InsertItemToBeReady',
        value: {
          name: itemName, quantity
        }
      }
    })
  }

  const handleRemoveItem = (index, event) => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'DeleteItemToBeReady',
        value: index
      }
    })
  }

  const renderItemsTable = () => {
    return botConfig.config.itemsToBeReady.map((item, index) => {
      return (
        <tr key={index}>
          <th scope='row'>{index}</th>
          <td>{item.name}</td>
          <td>{item.quantity}</td>
          <td><TrashIcon onClick={handleRemoveItem.bind(this, index)} /></td>
        </tr>
      )
    })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <label>
            This is a minimun requeried for start bot to work,<br />
            Example, Guard need a sword and shield, Miner need a 1 pickaxe
          </label>
        </div>
      </div>

      <div className='row'>
        <div className='col-6'>
          <div className='form-group'>
            <label htmlFor='inputItem'>Select Item</label>
            <input className='form-control' type='text' list='itemsList' value={itemName} onChange={handleItemChange} />
            <datalist id='itemsList'>
              <ItemsAviable item={itemName} type="all" />
            </datalist>
          </div>
        </div>

        <div className='col-2'>
          <div className='form-group'>
            <label>Quantity</label>
            <input type='text' className='form-control' value={quantity} onChange={handleQuantityChange} />
          </div>
        </div>

        <div className='col-2'>
          <div className='form-group'>
            <label>.</label>
            <button className='form-control btn btn-primary' onClick={handleInsertItem}>Insert</button>
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-12'>

          <table className='table'>
            <thead className='thead-dark'>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Item</th>
                <th scope='col'>Quantity</th>
                <th scope='col' />
              </tr>
            </thead>
            <tbody>
              {renderItemsTable()}
            </tbody>
          </table>
        </div>
      </div>

    </>
  )
}

