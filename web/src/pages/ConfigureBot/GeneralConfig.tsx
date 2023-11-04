// @ts-nocheck
import React, { useContext, useState } from "react";
import { ArrowDown, ArrowUp, Trash, FormCheck, Coords } from "@/components";
import { ItemsAviable } from "./ItemsAviable";
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from "@/hooks/useChangeConfig";
import { Button, Col, Form, Row, Table } from "react-bootstrap";

export const GeneralConfig: React.FC = () => {
  const bot = useContext(BotSelectedContext);

  const [itemName, setItemName] = useState("");
  const changeConfig = useChangeConfig()

  const handleInsertItem = () => {
    if (itemName === "") {
      return null;
    }

    changeConfig("insertItemCanBeEat", { name: itemName });
  };


  const handleChangeJob = (event) => {
    changeConfig("job", event.target.value);
  };

  const handleChangeSleepArea = (event, coord) => {
    const pos = Number(event.target.value)

    if (!Number.isInteger(pos) && event.target.value !== '-') {
      return null
    }

    changeConfig('sleepArea', {
      coord,
      pos: event.target.value
    })
  }

  return (
    <>
      <Row className="mb-4">
        <Col xs={12} md={6} lg={4}>
          <Row className="mb-3">
            <Col sm={4}>
              Job
            </Col>
            <Col xs={6} sm={3}>
              <Form.Check
                id="none"
                value="none"
                label="None"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "none"}
              />

              <Form.Check
                id="miner"
                value="miner"
                label="Miner"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "miner"}
              />

              <Form.Check
                id="guard"
                value="guard"
                label="Guard"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "guard"}
              />

              <Form.Check
                id="crafter"
                value="crafter"
                label="Crafter"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "crafter"}
              />
            </Col>
            <Col xs={6} sm={3}>
              <Form.Check
                id="farmer"
                value="farmer"
                label="Farmer"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "farmer"}
              />

              <Form.Check
                id="breeder"
                value="breeder"
                label="Breeder"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "breeder"}
              />

              <Form.Check
                id="sorter"
                value="sorter"
                label="Sorter"
                type="radio"
                onChange={handleChangeJob}
                checked={bot.config.job === "sorter"}
              />

            </Col>
          </Row>
        </Col>

        <Col xs={12} sm={6}>
          <FormCheck
            id={"allowSprinting"}
            onChange={() => changeConfig("allowSprinting", !bot.config.allowSprinting)}
            label={`Allow Sprint`}
            checked={bot.config.allowSprinting}
            className="mb-3"
          />

          <FormCheck
            id={"allowScanDigprinting"}
            onChange={() => changeConfig("canDig", !bot.config.canDig)}
            label={
              <>
                <div>Can dig?</div>
                <div>(!) Caution can stuck the bot</div>
              </>
            }
            checked={bot.config.canDig}
            className="mb-3"
          />

          <FormCheck
            id={"allowCanPlaceBlocks"}
            onChange={() => changeConfig("canPlaceBlocks", !bot.config.canPlaceBlocks)}
            label={
              <>
                <div>Can place blosk?</div>
                <div>(!) Caution can stuck the bot</div>
              </>
            }
            checked={bot.config.canPlaceBlocks}
          />

          <FormCheck
            id={"pickUpItems"}
            onChange={() => changeConfig("pickUpItems", !bot.config.pickUpItems)}
            label={`Pick up items?`}
            checked={bot.config.pickUpItems}
          />

          <FormCheck
            id={"randomFarmArea"}
            onChange={() => changeConfig("randomFarmArea", !bot.config.randomFarmArea)}
            label={`Random Farmer area?`}
            checked={bot.config.randomFarmArea}
          />

        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={12} md={7} className="mb-3">
          <div className="mb-3">
            <Coords
              label='Bed Coords'
              coords={{
                x: bot.config.sleepArea?.x ?? '',
                y: bot.config.sleepArea?.y ?? '',
                z: bot.config.sleepArea?.z ?? ''
              }}
              onChange={handleChangeSleepArea}
            />
            <FormCheck
              id={"canSleep"}
              onChange={() => changeConfig("canSleep", !bot.config.canSleep)}
              label={`Can sleep`}
              checked={bot.config.canSleep}
            />
          </div>
        </Col>
      </Row>

      <div>
        <h3>Valid food for eat</h3>
      </div>

      <Row className="d-flex align-items-end">
        <Col xs={12} sm={6} className="mb-2">

          <Form.Group>
            <Form.Label>
              (!) The food consumition have priority based on # inserted
            </Form.Label>

            <Form.Control
              value={itemName}
              list="itemsList"
              onChange={(e) => setItemName(e.target.value)}
            />

          </Form.Group>

          <datalist id="itemsList">
            <ItemsAviable item={itemName} type="foods" />
          </datalist>
        </Col>

        <Col xs={12} sm={'auto'} className="mb-2">
          <Button onClick={handleInsertItem}>
            Insert
          </Button>
        </Col>
      </Row>

      <Table>
        <thead>
          <tr>
            <th scope="col">Priority</th>
            <th scope="col">Food</th>
            <th scope="col">Move</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {bot.config.itemsCanBeEat.map((food, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{food}</td>
              <td>
                <ArrowUp
                  disabled={index === 0}
                  onClick={() => changeConfig("moveItemCanBeEatPrev", index)}
                />{" "}
                <ArrowDown
                  disabled={index === bot.config.itemsCanBeEat.length - 1}
                  onClick={() => changeConfig("moveItemCanBeEatNext", index)}
                />
              </td>
              <td>
                <Trash
                  onClick={() => changeConfig("deleteItemCanBeEat", index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};