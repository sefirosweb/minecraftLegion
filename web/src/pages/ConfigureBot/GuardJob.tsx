import React, { useContext, useState } from "react";
import toastr from 'toastr'
import { ArrowDown, ArrowUp, Coords, Trash } from "@/components";
import { BotSelectedContext } from "./ConfigurationContext";
import { useChangeConfig } from "@/hooks/useChangeConfig";
import { useStore } from "@/hooks/useStore";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { Vec3 } from "vec3";
import axios from "axios";
import { useGetSelectedBot } from "@/hooks/useGetSelectedBot";

export const GuardJob: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);
  const master = useStore(state => state.master)
  const [pos, setPos] = useState<Vec3 | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const bot = useGetSelectedBot()
  const sendConfig = useChangeConfig()

  const insertPost = () => {
    if (!pos) return;
    addNewPos(pos)
    setPos(undefined)
  };

  const addNewPos = (pos: Vec3) => {
    const patrol = structuredClone(botConfig.patrol)
    patrol.push(pos.clone())
    updateConfig("patrol", patrol)
  }

  const handleRemovePos = (index: number) => {
    const patrol = structuredClone(botConfig.patrol)
    patrol.splice(index, 1)
    updateConfig("patrol", patrol)

  };

  const handleMovePosNext = (index: number) => {
    const patrol = structuredClone(botConfig.patrol)
    if (patrol.length > index + 1) {
      const temp = patrol[index]
      patrol[index] = patrol[index + 1]
      patrol[index + 1] = temp
      updateConfig("patrol", patrol)
    }
  };

  const handleMovePosPrev = (index: number) => {
    const patrol = structuredClone(botConfig.patrol)
    if (index > 0) {
      const temp = patrol[index]
      patrol[index] = patrol[index - 1]
      patrol[index - 1] = temp
      updateConfig("patrol", patrol)
    }
  };

  const handleButtonSavePositionHasMaster = () => {
    setIsLoading(true)
    axios.get(`/api/get_master_position/${bot?.socketId}/${master}`)
      .then((response) => {
        const pos = new Vec3(response.data.x, response.data.y, response.data.z).floor()
        addNewPos(pos)
      })
      .catch((error) => {
        toastr.error(error.response.data.error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  };



  const handleButtonClearPositions = () => {
    updateConfig("patrol", []);
  };

  const copyPatrol = () => {
    sendConfig("copyPatrol", master);
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">

        <div>
          <Form.Check
            disabled={isLoading}
            type="switch"
            id="helpFriends"
            label="Help Friend?"
            checked={botConfig.helpFriends}
            onChange={() => updateConfig("helpFriends", !botConfig.helpFriends)}
          />
        </div>

        <div>
          <Button
            disabled={isLoading}
            variant="primary"
            onClick={handleButtonSavePositionHasMaster}
          >
            Copy the same position as the master
          </Button>
        </div>

        <div>
          <Button
            disabled={isLoading}
            variant="danger"
            onClick={handleButtonClearPositions}
          >
            Clear all positions
          </Button>
        </div>

      </div>

      <div>
        <label>Position</label>
      </div>

      <Row>
        <Col lg={8}>
          <Coords
            coords={pos}
            onChange={setPos}
          />
        </Col>

        <Col lg={4} className="d-grid gap-1">
          <Button onClick={insertPost}>Insert</Button>

          {botConfig.isCopingPatrol ? (
            <Button variant="warning" onClick={copyPatrol}>Stop Copy</Button>
          ) : (
            <Button variant="success" onClick={copyPatrol}>Start Copy</Button>
          )}
        </Col>
      </Row>


      <Table responsive striped>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">POS</th>
            <th scope="col">Move</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {botConfig.patrol.map((pos, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>
                X:{pos.x}
                <br />
                Y:{pos.y}
                <br />
                Z:{pos.z}
              </td>
              <td>
                <ArrowUp onClick={() => handleMovePosPrev(index)} className="me-2" />
                <ArrowDown onClick={() => handleMovePosNext(index)} />
              </td>
              <td>
                <Trash onClick={() => handleRemovePos(index)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};
