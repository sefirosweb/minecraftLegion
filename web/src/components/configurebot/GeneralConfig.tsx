//@ts-nocheck
import { Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TrashIcon from "./Icons/Trash";
import ArrowUp from "./Icons/ArrowUp";
import ArrowDown from "./Icons/ArrowDown";
import FormCheck from "../forms/FormCheck";
import Coords from "../forms/Coords";
import ItemsAviable from "./ItemsAviable";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@/state";

const GeneralConfig = () => {

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);


  const [itemName, setItemName] = useState("");
  const botConfig = getBotBySocketId(selectedSocketId);

  if (botConfig === undefined) {
    return null;
  }

  const changeConfig = (configToChange, value) => {
    socket.emit("sendAction", {
      action: "changeConfig",
      socketId: botConfig.socketId,
      value: {
        configToChange,
        value,
      },
    });
  };

  const handleItemChange = (event) => {
    setItemName(event.target.value);
  };

  const handleInsertItem = (event) => {
    if (itemName === "") {
      return null;
    }

    changeConfig("InsertItemCanBeEat", { name: itemName });
  };

  const renderItemsTable = () => {
    return botConfig.config.itemsCanBeEat.map((food, index) => {
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
      socketId: botConfig.socketId,
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
                  checked={botConfig.config.job === "none"}
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
                  checked={botConfig.config.job === "miner"}
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
                  checked={botConfig.config.job === "guard"}
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
                  checked={botConfig.config.job === "crafter"}
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
                  checked={botConfig.config.job === "farmer"}
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
                  checked={botConfig.config.job === "breeder"}
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
                  checked={botConfig.config.job === "sorter"}
                />
                <label className="form-check-label">Sorter</label>
              </div>
            </div>
          </fieldset>

          <FormCheck
            id={"pickUpItems"}
            onChange={() =>
              changeConfig("pickUpItems", !botConfig.config.pickUpItems)
            }
            label={`Pick up items?`}
            checked={botConfig.config.pickUpItems}
          />

          <FormCheck
            id={"randomFarmArea"}
            onChange={() =>
              changeConfig("randomFarmArea", !botConfig.config.randomFarmArea)
            }
            label={`Random Farmer area?`}
            checked={botConfig.config.randomFarmArea}
          />

          <FormCheck
            id={"canSleep"}
            onChange={() =>
              changeConfig("canSleep", !botConfig.config.canSleep)
            }
            label={`Can sleep`}
            checked={botConfig.config.canSleep}
          />

          <Coords
            label='Coords'
            coords={{
              x: botConfig.config.sleepArea?.x ?? '',
              y: botConfig.config.sleepArea?.y ?? '',
              z: botConfig.config.sleepArea?.z ?? ''
            }}
            onChange={handleChangeSleepArea}
          />
        </div>

        <div className="col-5">
          <FormCheck
            id={"allowSprinting"}
            onChange={() =>
              changeConfig("allowSprinting", !botConfig.config.allowSprinting)
            }
            label={`Allow Sprint`}
            checked={botConfig.config.allowSprinting}
          />

          <FormCheck
            id={"allowScanDigprinting"}
            onChange={() => changeConfig("canDig", !botConfig.config.canDig)}
            label={
              <>
                Can dig? <br /> (!) Caution can stuck the bot
              </>
            }
            checked={botConfig.config.canDig}
          />

          <FormCheck
            id={"allowCanPlaceBlocks"}
            onChange={() => changeConfig("canPlaceBlocks", !botConfig.config.canPlaceBlocks)}
            label={
              <>
                Can place blosk? <br /> (!) Caution can stuck the bot
              </>
            }
            checked={botConfig.config.canPlaceBlocks}
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
              onChange={handleItemChange}
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

export default GeneralConfig

// const mapStateToProps = (reducers) => {
//   const { botsReducer, configurationReducer } = reducers;
//   const { botsOnline } = botsReducer;
//   const { socket, selectedSocketId } = configurationReducer;

//   return { botsOnline, socket, selectedSocketId };
// };

// const mapDispatchToProps = {
//   getBotBySocketId,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(GeneralConfig);
