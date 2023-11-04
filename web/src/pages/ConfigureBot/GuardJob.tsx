import React, { useContext, useState } from "react";
import { ArrowDown, ArrowUp, Trash, FormCheck } from "@/components";
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from "@/hooks/useChangeConfig";
import { useGetMaster } from "@/hooks/useGetMaster";

export const GuardJob: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);
  const master = useGetMaster()

  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");

  const sendConfig = useChangeConfig()

  const changePos = (event: React.ChangeEvent<HTMLInputElement>) => {

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

    sendConfig("addPatrol", {
      x: Number(x),
      y: Number(y),
      z: Number(z),
    });
  };

  const handleRemovePos = (index: number) => {
    sendConfig("removePatrol", index);
  };

  const handleMovePosNext = (index: number) => {
    sendConfig("movePatrolNext", index);
  };

  const handleMovePosPrev = (index: number) => {
    sendConfig("movePatrolPrev", index);
  };

  const handleButtonSavePositionHasMaster = () => {

    sendConfig("savePositionHasMaster", master);
  };



  const handleButtonClearPositions = () => {
    sendConfig("clearAllPositions");
  };

  const copyPatrol = () => {
    sendConfig("copyPatrol", master);
  };

  return (
    <>
      <div className="row">
        <div className="col-6">
          <FormCheck
            id={"helpFriends"}
            onChange={() =>
              sendConfig("helpFriends", !botConfig.config.helpFriends)
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
          {botConfig.isCopingPatrol ? (
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
            <tbody>
              {botConfig.config.patrol.map((pos, index) => (
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
                    <ArrowUp onClick={() => handleMovePosPrev(index)} />{" "}
                    <ArrowDown onClick={() => handleMovePosPrev(index)} />
                  </td>
                  <td>
                    <Trash onClick={() => handleRemovePos(index)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
