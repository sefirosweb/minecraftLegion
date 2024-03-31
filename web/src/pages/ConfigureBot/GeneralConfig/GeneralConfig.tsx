import React, { useContext } from "react";
import { Coords } from "@/components";
import { BotSelectedContext } from "../ConfigurationContext";
import { Col, Form, Row } from "react-bootstrap";
import { Jobs } from "base-types";
import { ValidFood } from "./ValidFood";

const isJob = (value: string): value is Jobs => Object.values(Jobs).includes(value as Jobs)

export const GeneralConfig: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const handleChangeJob = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isJob(value)) return console.error(`Invalid job ${value}`)
    updateConfig("job", value)
  }

  return (
    <>
      <Row className="mb-4">
        <Col xs={12} md={6} lg={4} className="mb-3">
          <Form>
            {Object.values(Jobs).map((job) => (
              <Form.Check
                className="text-capitalize"
                id={job}
                key={job}
                value={job}
                label={job}
                type="radio"
                onChange={handleChangeJob}
                checked={botConfig.job === job}
              />
            ))}
          </Form>
        </Col>

        <Col xs={12} sm={6}>
          <Form.Check
            type="switch"
            id="allowSprinting"
            label="Allow Sprint"
            checked={botConfig.allowSprinting}
            onChange={() => updateConfig("allowSprinting", !botConfig.allowSprinting)}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="allowScanDigprinting"
            label={
              <>
                <div>Can dig?</div>
                <div>(!) Caution can stuck the bot</div>
              </>
            }
            checked={botConfig.canDig}
            onChange={() => updateConfig("canDig", !botConfig.canDig)}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="allowCanPlaceBlocks"
            label={
              <>
                <div>Can place blosk?</div>
                <div>(!) Caution can stuck the bot</div>
              </>
            }
            checked={botConfig.canPlaceBlocks}
            onChange={() => updateConfig("canPlaceBlocks", !botConfig.canPlaceBlocks)}
          />

          <Form.Check
            type="switch"
            id="pickUpItems"
            label="Pick up items?"
            checked={botConfig.pickUpItems}
            onChange={() => updateConfig("pickUpItems", !botConfig.pickUpItems)}
          />

          <Form.Check
            type="switch"
            id="randomFarmArea"
            label="Random Farmer area?"
            checked={botConfig.randomFarmArea}
            onChange={() => updateConfig("randomFarmArea", !botConfig.randomFarmArea)}
          />

        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={12} md={7} className="mb-3">
          <div className="mb-3">
            <Coords
              coords={botConfig.sleepArea}
              label='Bed Coords'
              onChange={(vec3) => updateConfig("sleepArea", vec3)}
            />
            <Form.Check
              type="switch"
              id="canSleep"
              label="Can sleep"
              checked={botConfig.canSleep}
              onChange={() => updateConfig("canSleep", !botConfig.canSleep)}
            />
          </div>
        </Col>
      </Row>

      <ValidFood />
    </>
  );
};