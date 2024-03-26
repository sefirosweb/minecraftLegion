import React, { useContext, useState } from "react";
import { ArrowDown, ArrowUp, ItemImage, ItemWithImageOption, SingleValueWithImage, Trash } from "@/components";
import { BotSelectedContext } from "../ConfigurationContext";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import AsyncSelect from 'react-select/async';
import { FoodOption, foodsOptions } from "@/lib";

export const ValidFood: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);
  const [itemName, setItemName] = useState<FoodOption | null>(null);

  const handleInsertItem = () => {
    if (!itemName) {
      return null;
    }

    const itemsCanBeEat = Array.from(new Set(botConfig.itemsCanBeEat.concat(itemName.value.name)))
    updateConfig("itemsCanBeEat", itemsCanBeEat)
    setItemName(null)
  };

  const deleteItem = (index: number) => {
    const itemsCanBeEat = botConfig.itemsCanBeEat.filter((_, i) => i !== index)
    updateConfig("itemsCanBeEat", itemsCanBeEat)
  }

  const upItem = (index: number) => {
    if (index === 0) return
    const itemsCanBeEat = Array.from(botConfig.itemsCanBeEat)
    const item = itemsCanBeEat[index]
    itemsCanBeEat[index] = itemsCanBeEat[index - 1]
    itemsCanBeEat[index - 1] = item
    updateConfig("itemsCanBeEat", itemsCanBeEat)
  }

  const downItem = (index: number) => {
    if (index === botConfig.itemsCanBeEat.length - 1) return
    const itemsCanBeEat = Array.from(botConfig.itemsCanBeEat)
    const item = itemsCanBeEat[index]
    itemsCanBeEat[index] = itemsCanBeEat[index + 1]
    itemsCanBeEat[index + 1] = item
    updateConfig("itemsCanBeEat", itemsCanBeEat)
  }

  return (
    <>
      <div>
        <h3>Valid food for eat</h3>
      </div>

      <Row className="d-flex align-items-end">
        <Col xs={12} sm={6} className="mb-2">

          <Form.Group controlId="validFoodForm">
            <Form.Label>
              (!) The food consumition have priority based on # inserted
            </Form.Label>

            <AsyncSelect
              defaultOptions
              components={{
                Option: ItemWithImageOption,
                SingleValue: SingleValueWithImage,
              }}
              isMulti={false}
              loadOptions={foodsOptions}
              value={itemName}
              getOptionLabel={(option) => option.label}
              onChange={(e) => setItemName(e as FoodOption)} />
          </Form.Group>

        </Col>

        <Col xs={12} sm={'auto'} className="mb-2">
          <Button onClick={handleInsertItem}>
            Insert
          </Button>
        </Col>
      </Row>

      <Table responsive>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Food</th>
            <th>Move</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {botConfig.itemsCanBeEat.map((food, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>
                <div className="d-flex justify-content-between">
                  <div>
                    {food}
                  </div>
                  <div>
                    <ItemImage alt={food} name={food} />
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex">
                  <ArrowUp
                    disabled={index === 0}
                    onClick={() => upItem(index)}
                    className="me-2 "
                  />
                  <ArrowDown
                    disabled={index === botConfig.itemsCanBeEat.length - 1}
                    onClick={() => downItem(index)}
                    className=""
                  />
                </div>
              </td>
              <td>
                <Trash onClick={() => deleteItem(index)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};