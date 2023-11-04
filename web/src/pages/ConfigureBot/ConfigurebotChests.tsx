import { Button, Col, ListGroup, Row } from "react-bootstrap";
import { Chest } from './Chest'
import React, { useContext } from "react";
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from "@/hooks/useChangeConfig";
import { FormCheck } from "@/components";

export const ConfigurebotChests: React.FC = () => {
  const bot = useContext(BotSelectedContext);
  const changeConfig = useChangeConfig()

  const handleInsertNewChest = () => {
    changeConfig("insertNewChest", '')
  };

  return (
    <>
      <FormCheck
        id={"firstPickUpItemsFromKnownChests"}
        onChange={() => changeConfig("firstPickUpItemsFromKnownChests", !bot.config.firstPickUpItemsFromKnownChests)}
        label='Use a memorized chest first?'
        checked={bot.config.firstPickUpItemsFromKnownChests}
      />
      <FormCheck
        id={"canCraftItemWithdrawChest"}
        onChange={() => changeConfig("canCraftItemWithdrawChest", !bot.config.canCraftItemWithdrawChest)}
        label='Craft item if it is possible?'
        checked={bot.config.canCraftItemWithdrawChest}
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

      {bot.config.chests.map((chest, index) => (
        <Chest
          key={index}
          id={index}
          chest={chest}
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
