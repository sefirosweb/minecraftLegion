//@ts-nocheck
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowUp from "./Icons/ArrowUp";
import ArrowDown from "./Icons/ArrowDown";
import TrashIcon from "./Icons/Trash";
import FormCheck from "../forms/FormCheck";
import { actionCreators, State } from "@/state";
import { bindActionCreators } from "redux";

const GuardJob = () => {

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId, master } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);

  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");

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

  const changePos = (event) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) && event.target.value !== "-") {
      return null;
    }

    switch (event.target.id) {
      case "xPos":
        setX(event.target.value);
        break;
      case "yPos":
        setY(event.target.value);
        break;
      case "zPos":
        setZ(event.target.value);
        break;
      default:
        return null;
    }
  };
  const insertPost = () => {
    if (
      !Number.isInteger(Number(x)) ||
      !Number.isInteger(Number(y)) ||
      !Number.isInteger(Number(z))
    ) {
      return null;
    }

    changeConfig("addPatrol", {
      x: Number(x),
      y: Number(y),
      z: Number(z),
    });
  };

  const handleRemovePos = (index) => {
    changeConfig("removePatrol", index);
  };

  const handleMovePosNext = (index) => {
    changeConfig("movePatrolNext", index);
  };

  const handleMovePosPrev = (index) => {
    changeConfig("movePatrolPrev", index);
  };

  const handleButtonSavePositionHasMaster = () => {
    changeConfig("savePositionHasMaster", master);
  };

  const renderPatrolTable = () => {
    return botConfig.config.patrol.map((pos, index) => {
      return (
        <tr key={index}>
          <th scope="row">{index}</th>
          <td>
            X:{pos.x}
            <br />
            Y:{pos.y}
            <br />
            Z:{pos.z}
          </td>
          <td>
            <ArrowUp onClick={handleMovePosPrev.bind(this, index)} />{" "}
            <ArrowDown onClick={handleMovePosNext.bind(this, index)} />
          </td>
          <td>
            <TrashIcon onClick={handleRemovePos.bind(this, index)} />
          </td>
        </tr>
      );
    });
  };


  const handleButtonClearPositions = () => {
    changeConfig("clearAllPositions");
  };

  const copyPatrol = () => {
    changeConfig("copyPatrol", master);
  };

  return (
    <>
      <div className="row">
        <div className="col-6">
          <FormCheck
            id={"helpFriends"}
            onChange={() =>
              changeConfig("helpFriends", !botConfig.config.helpFriends)
            }
            label={`Help Friend?`}
            checked={botConfig.config.helpFriends}
          />
        </div>
        <div className="col-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleButtonSavePositionHasMaster}
          >
            Copy the same position as the master
          </button>
        </div>
        <div className="col-3">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleButtonClearPositions}
          >
            Clear all positions
          </button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-2">
          <label>Position XYZ:</label>
        </div>
        <div className="col-2">
          <input
            type="text"
            className="form-control"
            placeholder="X"
            id="xPos"
            value={x}
            onChange={changePos}
          />
        </div>
        <div className="col-2">
          <input
            type="text"
            className="form-control"
            placeholder="Y"
            id="yPos"
            value={y}
            onChange={changePos}
          />
        </div>
        <div className="col-2">
          <input
            type="text"
            className="form-control"
            placeholder="Z"
            id="zPos"
            value={z}
            onChange={changePos}
          />
        </div>
        <div className="col-2">
          <button
            type="button"
            className="btn btn-primary form-control"
            onClick={insertPost}
          >
            Insert
          </button>
        </div>
        <div className="col-2">
          {botConfig.config.isCopingPatrol ? (
            <button
              type="button"
              className="btn btn-warning form-control"
              onClick={copyPatrol}
            >
              Stop Copy
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success form-control"
              onClick={copyPatrol}
            >
              Start Copy
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">POS</th>
                <th scope="col">Move</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>{renderPatrolTable()}</tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GuardJob

// const mapStateToProps = (reducers) => {
//   const { botsReducer, configurationReducer } = reducers;
//   const { botsOnline } = botsReducer;
//   const { socket, selectedSocketId, master } = configurationReducer;

//   return { botsOnline, socket, selectedSocketId, master };
// };

// const mapDispatchToProps = {
//   getBotBySocketId,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(GuardJob);
