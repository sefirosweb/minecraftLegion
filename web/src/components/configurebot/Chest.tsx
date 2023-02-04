//@ts-nocheck
import { useState } from "react";
import ItemsAviable from "./ItemsAviable";
import TrashIcon from "./Icons/Trash";
import ArrowUp from "./Icons/ArrowUp";
import ArrowDown from "./Icons/ArrowDown";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { State } from "@/state";

const Chest = (props) => {
  const { id, chest, socketId, } = props
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, master } = configurationState

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const chestId = `chest-${id}`;
  const radioId = `radio-${id}`;

  const changeConfig = (configToChange, value) => {
    socket.emit("sendAction", {
      action: "changeConfig",
      socketId: socketId,
      value: {
        configToChange,
        value,
      },
    });
  };

  const handleDeleteChest = (event) => {
    changeConfig("deleteChest", id);
  };

  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value)) {
      setQuantity(value);
    }
  };

  const handleItemChange = (event) => {
    setItemName(event.target.value);
  };

  const handleInsertItemInChest = (event) => {
    changeConfig("insertItemInChest", {
      chestId: id,
      name: itemName,
      quantity,
    });
  };

  const renderItemsTable = () => {
    return chest.items.map((item, index) => {
      return (
        <tr key={index}>
          <th scope="row">{index}</th>
          <td>{item.name}</td>
          <td>{item.quantity}</td>
          <td>
            <TrashIcon onClick={() => handleRemoveItemFromChest(index)} />
          </td>
        </tr>
      );
    });
  };

  const handleRemoveItemFromChest = (index) => {
    changeConfig("removeItemFromChest", {
      chestId: id,
      itemIndex: index,
    });
  };

  const handleChangeChestType = (event) => {
    changeConfig("changeChestType", {
      value: event.target.value,
      chestId: id,
    });
  };

  const handleChangeChestName = (event) => {
    changeConfig("changeChestName", {
      value: event.target.value,
      chestId: id,
    });
  };

  const handleChangeChestPos = (event) => {
    const pos = Number(event.target.value);

    if (!Number.isInteger(pos) && event.target.value !== "-" && event.target.dataset.coord !== 'dimension') {
      return null;
    }

    changeConfig("changeChestPos", {
      pos: event.target.value,
      chestId: id,
      coord: event.target.dataset.coord,
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

  const handleMovePosNext = (index, event) => {
    changeConfig("moveChestNext", id);
  };

  const handleMovePosPrev = (index, event) => {
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
            data-coord="dimension"
            value={chest.dimension ? chest.dimension : ""}
            onChange={handleChangeChestPos}
          >
            <option value='minecraft:overworld'>Overworld</option>
            <option value='minecraft:the_nether'>The Nether</option>
            <option value='minecraft:the_end'>The End</option>
          </Form.Select>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>X</Form.Label>
          <Form.Control
            data-coord="x"
            value={chest.position.x ? chest.position.x : ""}
            onChange={handleChangeChestPos}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Y</Form.Label>
          <Form.Control
            data-coord="y"
            value={chest.position.y ? chest.position.y : ""}
            onChange={handleChangeChestPos}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Z</Form.Label>
          <Form.Control
            data-coord="z"
            value={chest.position.z ? chest.position.z : ""}
            onChange={handleChangeChestPos}
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
            <tbody>{renderItemsTable()}</tbody>
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

export default Chest

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers;
//   const { socket, master } = configurationReducer;
//   return { socket, master };
// };

// export default connect(mapStateToProps, null)(Chest);
