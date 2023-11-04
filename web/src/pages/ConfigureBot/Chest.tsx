import React, { useState } from "react";
import { ItemsAviable } from "./ItemsAviable";
import { ArrowDown, ArrowUp, Trash } from "@/components";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useChangeConfig } from "@/hooks/useChangeConfig";
import { useGetMaster } from "@/hooks/useGetMaster";
import { Chest as TypeChest } from "base-types";

type Props = {
  id: number
  chest: TypeChest
}

export const Chest: React.FC<Props> = (props) => {
  const { id, chest } = props
  const master = useGetMaster()
  const changeConfig = useChangeConfig()

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const chestId = `chest-${id}`;
  const radioId = `radio-${id}`;

  const handleDeleteChest = () => {
    changeConfig("deleteChest", id);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value)) {
      setQuantity(value);
    }
  };

  const handleItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
  };

  const handleInsertItemInChest = () => {
    changeConfig("insertItemInChest", {
      chestId: id,
      name: itemName,
      quantity,
    });
  };

  const handleRemoveItemFromChest = (index: number) => {
    changeConfig("removeItemFromChest", {
      chestId: id,
      itemIndex: index,
    });
  };

  const handleChangeChestType = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeConfig("changeChestType", {
      value: event.target.value,
      chestId: id,
    });
  };

  const handleChangeChestName = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeConfig("changeChestName", {
      value: event.target.value,
      chestId: id,
    });
  };

  const handleChangeChestPos = (value: string, element: string) => {
    const pos = Number(value);

    if (!Number.isInteger(pos) && value !== "-" && element !== 'dimension') {
      return null;
    }

    changeConfig("changeChestPos", {
      pos: value,
      chestId: id,
      coord: element,
    });
  };

  const handleCopyPositionMaster = () => {
    changeConfig("changeChestPosMaster", {
      chestId: id,
      master: master,
    });
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

  const handleMovePosNext = () => {
    changeConfig("moveChestNext", id);
  };

  const handleMovePosPrev = () => {
    changeConfig("moveChestPrev", id);
  };

  return (
    <div className={`p-3 mb-3 border rounded ${renderSwitch()}`}>
      <Row>
        <Col xs={6}>

          <Form.Group as={Row} controlId="formChestName">
            <Form.Label column sm={4} className='col-form-label font-weight-bold'>
              Chest Nº{id}
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="email"
                className="form-control-plaintext font-weight-bold"
                value={chest.name}
                onChange={handleChangeChestName}
              />
            </Col>
          </Form.Group>

        </Col>

        <Col xs={4}>
          <div className="float-right">Sort chest:</div>
        </Col>

        <Col xs={2}>
          <div className="float-right">
            {" "}
            <ArrowUp onClick={handleMovePosPrev} />{" "}
            <ArrowDown onClick={handleMovePosNext} />
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={6}>
          <div className="form-group">
            <label htmlFor="inputItem">Select Item</label>
            <input
              className="form-control"
              type="text"
              list={chestId}
              value={itemName}
              onChange={handleItemChange}
            />
            <datalist id={chestId}>
              <ItemsAviable item={itemName} />
            </datalist>
          </div>
        </Col>

        <Col xs={2}>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="text"
              className="form-control"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
        </Col>

        <Col xs={2}>
          <div className="form-group">
            <label>Type</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={radioId}
                value="withdraw"
                onChange={handleChangeChestType}
                checked={chest.type === "withdraw"}
              />
              <label className="form-check-label">Withdraw</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={radioId}
                value="deposit"
                onChange={handleChangeChestType}
                checked={chest.type === "deposit"}
              />
              <label className="form-check-label">Deposit</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={radioId}
                value="depositAll"
                onChange={handleChangeChestType}
                checked={chest.type === "depositAll"}
              />
              <label className="form-check-label">Deposit All</label>
            </div>
          </div>
        </Col>

        <Col xs={2}>
          <div className="form-group">
            <label>.</label>
            <button
              type="button"
              className="form-control btn btn-primary"
              onClick={handleInsertItemInChest}
            >
              Insert Item
            </button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Dimension:</Form.Label>
          <Form.Select
            value={chest.dimension ? chest.dimension : ""}
            onChange={(e) => handleChangeChestPos(e.target.value, 'dimension')}
          >
            <option value='overworld'>Overworld</option>
            <option value='the_nether'>The Nether</option>
            <option value='the_end'>The End</option>
          </Form.Select>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>X</Form.Label>
          <Form.Control
            value={chest.position.x ? chest.position.x : ""}
            onChange={(e) => handleChangeChestPos(e.target.value, 'x')}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Y</Form.Label>
          <Form.Control
            value={chest.position.y ? chest.position.y : ""}
            onChange={(e) => handleChangeChestPos(e.target.value, 'y')}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Z</Form.Label>
          <Form.Control
            value={chest.position.z ? chest.position.z : ""}
            onChange={(e) => handleChangeChestPos(e.target.value, 'z')}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button type="button" onClick={handleCopyPositionMaster}>
            Copy position same has master
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Item Name</th>
                <th scope="col">Quantity</th>
                <th scope="col" />
              </tr>
            </thead>

            <tbody>
              {chest.items.map((item, index) => (
                <tr key={index}>
                  <th scope="row">{index}</th>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td><Trash onClick={() => handleRemoveItemFromChest(index)} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <button
            type="button"
            className="btn btn-danger float-right"
            onClick={handleDeleteChest}
          >
            Delete chest "{chest.name}"
          </button>
        </Col>
      </Row>


    </div>
  );
};
