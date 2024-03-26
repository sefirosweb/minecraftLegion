import React, { useContext, useState } from 'react'
import { ItemImage, ItemWithImageOption, SingleValueWithImage, Trash } from '@/components'
import { BotSelectedContext } from "./ConfigurationContext";
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { ItemOption, itemOptions } from '@/lib';

export const ItemsToBeReady: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);
  const [itemName, setItemName] = useState<ItemOption | null>(null);
  const [quantity, setQuantity] = useState('1')

  const handleInsertItem = () => {
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0 || !itemName) return

    const itemsToBeReady = structuredClone(botConfig.itemsToBeReady)
    const newItem = { name: itemName.value.name, quantity: qty }
    const existingItemIndex = itemsToBeReady.findIndex(item => item.name === itemName.value.name)
    if (existingItemIndex !== -1) {
      itemsToBeReady[existingItemIndex] = newItem
    } else {
      itemsToBeReady.push(newItem)
    }

    updateConfig("itemsToBeReady", itemsToBeReady)

    setItemName(null)
    setQuantity('1')
  }

  const handleRemoveItem = (index: number) => {
    const itemsToBeReady = structuredClone(botConfig.itemsToBeReady)
    itemsToBeReady.splice(index, 1)
    updateConfig("itemsToBeReady", itemsToBeReady)
  }

  return (
    <>
      <div className='mb-3'>
        This is a minimun requeried for start bot to work <br />
        Example, Guard need a sword and shield, Miner need a 1 pickaxe
      </div>

      <Row className='mb-3 align-items-end '>
        <Col xs={6}>
          <Form.Group controlId='itemListToBeReadyForm'>
            <Form.Label>Select Item</Form.Label>

            <AsyncSelect
              defaultOptions
              components={{
                Option: ItemWithImageOption,
                SingleValue: SingleValueWithImage,
              }}
              isMulti={false}
              loadOptions={itemOptions}
              value={itemName}
              getOptionLabel={(option) => option.label}
              onChange={(e) => setItemName(e as ItemOption)} />
          </Form.Group>
        </Col>

        <Col xs={2}>
          <Form.Group controlId='itemListToBeReadyQuantityForm'>
            <Form.Label>Quantity</Form.Label>
            <Form.Control type='number' value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Form.Group>
        </Col>

        <Col xs={2}>
          <Button className='w-100' onClick={handleInsertItem}>Insert</Button>
        </Col>
      </Row>

      <div className='mb-3'>
        <Table responsive>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {botConfig.itemsToBeReady.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="d-flex justify-content-between">
                    <div>
                      {item.name}
                    </div>
                    <div>
                      <ItemImage alt={item.name ?? ''} name={item.name ?? ''} />
                    </div>
                  </div>
                </td>
                <td>{item.quantity}</td>
                <td><Trash onClick={handleRemoveItem.bind(this, index)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

    </>
  )
}

