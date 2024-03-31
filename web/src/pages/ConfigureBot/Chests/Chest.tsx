import React, { useContext, useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import AsyncSelect from 'react-select/async';
import axios from "axios";
import { Vec3 } from "vec3";
import toastr from 'toastr'
import { ArrowDown, ArrowUp, Coords, ItemImage, ItemWithImageOption, SingleValueWithImage, Trash } from "@/components";
import { Chest as TypeChest, isDepositType } from "base-types";
import { ItemOption, itemOptions } from "@/lib";
import { useStore } from "@/hooks/useStore";
import { BotSelectedContext } from "../ConfigurationContext";


type Props = {
  uuid: string
  chest: TypeChest
  handleMovePosNext: () => void
  handleMovePosPrev: () => void
  disabledMoveNext: boolean
  disabledMovePrev: boolean
  handleDeleteChest: () => void
  handleChangeChest: (chest: TypeChest) => void
}


export const Chest: React.FC<Props> = (props) => {
  const { uuid, chest, handleMovePosNext, handleMovePosPrev, disabledMoveNext, disabledMovePrev, handleDeleteChest, handleChangeChest } = props
  const { bot } = useContext(BotSelectedContext);
  const [master] = useStore(state => [state.master, state.socket])

  const [itemName, setItemName] = useState<ItemOption | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const handleInsertItemInChest = () => {
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0 || !itemName) return

    const newChest = structuredClone(chest)
    const item = newChest.items.find(item => item.name === itemName.value.name)
    if (item) {
      item.quantity = qty
    } else {
      newChest.items.push({
        name: itemName.value.name,
        quantity: Number(quantity),
      })
    }

    handleChangeChest(newChest)
    setItemName(null)
    setQuantity("1")
  };

  const handleRemoveItemFromChest = (index: number) => {
    const newChest = structuredClone(chest)
    newChest.items.splice(index, 1)
    handleChangeChest(newChest)
  };

  const handleChangeChestType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isDepositType(value)) return
    const newChest = structuredClone(chest)
    newChest.type = value
    handleChangeChest(newChest)
  };

  const handleChangeChestName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChest = structuredClone(chest)
    newChest.name = e.target.value
    handleChangeChest(newChest)
  };

  const handleChangeDimension = (value: string) => {
    const newChest = structuredClone(chest)
    newChest.dimension = value
    handleChangeChest(newChest)
  };

  const handleChangeChestPos = (value: Vec3 | undefined) => {
    if (!value) return
    const newChest = structuredClone(chest)
    newChest.position = value
    handleChangeChest(newChest)
  }

  const handleCopyPositionMaster = () => {
    setIsLoading(true)
    axios.get(`/api/get_master_position/${bot?.socketId}/${master}`)
      .then((response) => {
        const pos = new Vec3(response.data.x, response.data.y, response.data.z).floor()
        console.log(pos)
        handleChangeChestPos(pos)
      })
      .catch((error) => {
        toastr.error(error.response.data.error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  };

  const renderSwitch = () => {
    switch (chest.type) {
      case "deposit":
        return "border-warning";
      case "depositAll":
        return "border-danger";
      case "withdraw":
        return "border-success";
      default:
        return "";
    }
  };

  return (
    <div className={`p-3 mb-3 border rounded ${renderSwitch()}`}>
      <Row>
        <Col xs={4} sm={6}>
          <Form.Group controlId={`formChestName_${uuid}`}>
            <Form.Control
              type="email"
              className="form-control-plaintext font-weight-bold"
              value={chest.name}
              onChange={handleChangeChestName}
            />
          </Form.Group>
        </Col>

        <Col xs={4}>
          <div className="float-right">Sort chest:</div>
        </Col>

        <Col xs={4} sm={2}>
          <div className="d-flex justify-content-evenly gap-1 ">
            <ArrowUp onClick={handleMovePosPrev} disabled={disabledMovePrev} />
            <ArrowDown onClick={handleMovePosNext} disabled={disabledMoveNext} />
          </div>
        </Col>
      </Row>

      <Row className="align-items-sm-end ">
        <Col xs={6}>
          <Form.Group controlId={`selectItemChestForm_${uuid}`}>
            <Form.Label>
              Select Item
            </Form.Label>
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

        <Col xs={6} lg={2}>
          <Form.Group controlId={`formQuantity_${uuid}`}>
            <Form.Label>
              Quantity
            </Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={6} lg={2}>

          <Form>
            <Form.Label>Type</Form.Label>
            {['withdraw', 'deposit', 'depositAll'].map((option) => (
              <Form.Check
                className="text-capitalize"
                id={`${option}_${uuid}`}
                key={`${option}_${uuid}`}
                value={option}
                label={option}
                type="radio"
                onChange={handleChangeChestType}
                checked={chest.type === option}
              />
            ))}
          </Form>
        </Col>

        <Col xs={6} lg={2}>
          <div className="d-flex justify-content-center mt-3">
            <Button onClick={handleInsertItemInChest}>Insert Item</Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">

        <Col xs={12} md={3}>
          <Form.Group controlId={`dimensionForm_${uuid}`}>
            <Form.Label>Dimension:</Form.Label>
            <Form.Select
              value={chest.dimension ?? ""}
              onChange={(e) => handleChangeDimension(e.target.value)}
            >
              <option value='overworld'>Overworld</option>
              <option value='the_nether'>The Nether</option>
              <option value='the_end'>The End</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Coords coords={chest.position} onChange={handleChangeChestPos} />
      </Row>

      <Button className="mb-3" onClick={handleCopyPositionMaster}>
        Copy position same has master
      </Button>

      <Table responsive>
        <thead>
          <tr>
            <th scope="col">Item Name</th>
            <th scope="col">Quantity</th>
            <th scope="col" />
          </tr>
        </thead>

        <tbody>
          {chest.items.map((item, index) => (
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
              <td><Trash onClick={() => handleRemoveItemFromChest(index)} /></td>
            </tr>
          ))}
        </tbody>
      </Table>


      <Button variant="danger" onClick={handleDeleteChest}>
        Delete chest "{chest.name}"
      </Button>
    </div>
  );
};
