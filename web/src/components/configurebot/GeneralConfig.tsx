// @ts-nocheck
import { Suspense, useContext, useState } from "react";
import TrashIcon from "./Icons/Trash";
import ArrowUp from "./Icons/ArrowUp";
import ArrowDown from "./Icons/ArrowDown";
import FormCheck from "../forms/FormCheck";
import Coords from "../forms/Coords";
import ItemsAviable from "./ItemsAviable";
import useGetSocket from "@/hooks/useGetSocket";
import { BotSelectedContext } from '@/utils/BotSelectedContext'
import { Socket } from "socket.io-client";

export const GeneralConfig = () => {
  const bot = useContext(BotSelectedContext);

  const [itemName, setItemName] = useState("");
  const socket = useGetSocket() as Socket

  const changeConfig = (configToChange: string, value: any) => {
    socket.emit("sendAction", {
      action: "changeConfig",
      socketId: bot.socketId,
      value: {
        configToChange,
        value,
      },
    });
  };

  const handleInsertItem = () => {
    if (itemName === "") {
      return null;
    }

    changeConfig("InsertItemCanBeEat", { name: itemName });
  };

  const renderItemsTable = () => {
    return bot.config.itemsCanBeEat.map((food, index) => {
      return (
        <tr key={index}>
          <th scope="row">{index + 1}</th>
          <td>{food}</td>
          <td>
            <ArrowUp
              onClick={() => changeConfig("moveItemCanBeEatPrev", index)}
            />{" "}
            <ArrowDown
              onClick={() => changeConfig("moveItemCanBeEatNext", index)}
            />
          </td>
          <td>
            <TrashIcon
              onClick={() => changeConfig("deleteItemCanBeEat", index)}
            />
          </td>
        </tr>
      );
    });
  };

  const handleChangeJob = (event) => {
    changeConfig("job", event.target.value);
  };

  const handleChangeSleepArea = (event, coord) => {
    const pos = Number(event.target.value)

    if (!Number.isInteger(pos) && event.target.value !== '-') {
      return null
    }

    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: bot.socketId,
      value: {
        configToChange: 'sleepArea',
        value: {
          coord,
          pos: event.target.value
        }
      }
    })
  }

  return (
    <>
      <div className="row">
        <div className="col-7">
          <fieldset className="form-group row">
            <legend className="col-form-label col-sm-4 float-sm-left pt-0">
              Job
            </legend>
            <div className="col-sm-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="none"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "none"}
                />
                <label className="form-check-label">None</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="miner"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "miner"}
                />
                <label className="form-check-label">Miner</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="guard"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "guard"}
                />
                <label className="form-check-label">Guard</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="crafter"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "crafter"}
                />
                <label className="form-check-label">Crafter</label>
              </div>
            </div>
            <div className="col-sm-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="farmer"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "farmer"}
                />
                <label className="form-check-label">Farmer</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="breeder"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "breeder"}
                />
                <label className="form-check-label">Breeder</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gridJob"
                  value="sorter"
                  onChange={handleChangeJob}
                  checked={bot.config.job === "sorter"}
                />
                <label className="form-check-label">Sorter</label>
              </div>
            </div>
          </fieldset>

          <FormCheck
            id={"pickUpItems"}
            onChange={() =>
              changeConfig("pickUpItems", !bot.config.pickUpItems)
            }
            label={`Pick up items?`}
            checked={bot.config.pickUpItems}
          />

          <FormCheck
            id={"randomFarmArea"}
            onChange={() =>
              changeConfig("randomFarmArea", !bot.config.randomFarmArea)
            }
            label={`Random Farmer area?`}
            checked={bot.config.randomFarmArea}
          />

          <FormCheck
            id={"canSleep"}
            onChange={() =>
              changeConfig("canSleep", !bot.config.canSleep)
            }
            label={`Can sleep`}
            checked={bot.config.canSleep}
          />

          <Coords
            label='Coords'
            coords={{
              x: bot.config.sleepArea?.x ?? '',
              y: bot.config.sleepArea?.y ?? '',
              z: bot.config.sleepArea?.z ?? ''
            }}
            onChange={handleChangeSleepArea}
          />
        </div>

        <div className="col-5">
          <FormCheck
            id={"allowSprinting"}
            onChange={() =>
              changeConfig("allowSprinting", !bot.config.allowSprinting)
            }
            label={`Allow Sprint`}
            checked={bot.config.allowSprinting}
          />

          <FormCheck
            id={"allowScanDigprinting"}
            onChange={() => changeConfig("canDig", !bot.config.canDig)}
            label={
              <>
                Can dig? <br /> (!) Caution can stuck the bot
              </>
            }
            checked={bot.config.canDig}
          />

          <FormCheck
            id={"allowCanPlaceBlocks"}
            onChange={() => changeConfig("canPlaceBlocks", !bot.config.canPlaceBlocks)}
            label={
              <>
                Can place blosk? <br /> (!) Caution can stuck the bot
              </>
            }
            checked={bot.config.canPlaceBlocks}
          />

        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <h3>Valid food for eat</h3>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="form-group">
            <label htmlFor="inputItem">
              (!) The food consumition have priority based on # inserted
            </label>
            <input
              className="form-control"
              type="text"
              list="itemsList"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <datalist id="itemsList">
              <Suspense fallback={
                <option>Loading...</option>
              }>
                <ItemsAviable item={itemName} type="foods" />
              </Suspense>
            </datalist>
          </div>
        </div>

        <div className="col-2">
          <div className="form-group">
            <label>.</label>
            <button
              className="form-control btn btn-primary"
              onClick={handleInsertItem}
            >
              Insert
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Priority</th>
                <th scope="col">Food</th>
                <th scope="col">Move</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>{renderItemsTable()}</tbody>
          </table>
        </div>
      </div>
    </>
  );
};