import { Button, Col, Form, ListGroup, Row } from "react-bootstrap";
import React, { useContext } from "react";
import { BotSelectedContext } from "../ConfigurationContext";
import { Chest as ChestType } from "base-types";
import { Vec3 } from "vec3";
import { v4 as uuidv4 } from 'uuid';
import { Chest } from "./Chest";


export const ConfigurebotChests: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);
  const { chests } = botConfig

  const handleInsertNewChest = () => {
    const newChests = structuredClone(chests)
    const chest: ChestType = {
      uuid: uuidv4(),
      name: 'Input chest name',
      type: 'withdraw',
      position: new Vec3(0, 0, 0),
      dimension: 'overworld',
      items: [],
    }
    newChests.push(chest)
    updateConfig("chests", newChests)
  };

  const handleMovePosNext = (index: number) => {
    if (index === chests.length - 1) return
    const newChests = structuredClone(chests)
    const chest = newChests[index]
    newChests[index] = newChests[index + 1]
    newChests[index + 1] = chest
    updateConfig("chests", newChests)
  };

  const handleMovePosPrev = (index: number) => {
    if (index === 0) return
    const newChests = structuredClone(chests)
    const chest = newChests[index]
    newChests[index] = newChests[index - 1]
    newChests[index - 1] = chest
    updateConfig("chests", newChests)
  };

  const handleDeleteChest = (index: number) => {
    const newChests = structuredClone(chests)
    newChests.splice(index, 1)
    updateConfig("chests", newChests)
  };

  const handleChangeChest = (index: number, chest: ChestType) => {
    const newChests = structuredClone(chests)
    newChests[index] = chest
    updateConfig("chests", newChests)
  }

  return (
    <>
      <Form.Check
        type="switch"
        id="firstPickUpItemsFromKnownChests"
        label="Use a memorized chest first?"
        checked={botConfig.firstPickUpItemsFromKnownChests}
        onChange={() => updateConfig("firstPickUpItemsFromKnownChests", !botConfig.firstPickUpItemsFromKnownChests)}
      />
      <Form.Check
        type="switch"
        id="canCraftItemWithdrawChest"
        label='Craft item if it is possible?'
        checked={botConfig.canCraftItemWithdrawChest}
        onChange={() => updateConfig("canCraftItemWithdrawChest", !botConfig.canCraftItemWithdrawChest)}
      />

      <Row>
        <Col>
          <ListGroup className='mb-3'>
            <ListGroup.Item>When the bot is not ready, they go to chest to withdraw or deposit items</ListGroup.Item>
            <ListGroup.Item variant="success">Withdraw the items selected</ListGroup.Item>
            <ListGroup.Item variant="warning">Deposit: only the items selected</ListGroup.Item>
            <ListGroup.Item variant="danger">Deposit all: excluding item to deposit selected</ListGroup.Item>
            <ListGroup.Item variant="dark">(!) The priority of chest is important for deposit / withdraw items in order</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>

      {chests.map((chest, index) => (
        <Chest
          key={chest.uuid}
          uuid={chest.uuid}
          chest={chest}
          handleMovePosNext={() => handleMovePosNext(index)}
          handleMovePosPrev={() => handleMovePosPrev(index)}
          disabledMoveNext={index === chests.length - 1}
          disabledMovePrev={index === 0}
          handleDeleteChest={() => handleDeleteChest(index)}
          handleChangeChest={(chest) => handleChangeChest(index, chest)}
        />
      ))}

      <Row className='mb-5'>
        <Col>
          <Button
            variant="success"
            onClick={handleInsertNewChest}
          >
            Insert New Chest
          </Button>
        </Col>
      </Row>
    </>
  );
};
