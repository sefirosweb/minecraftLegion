import React from "react";
import { State } from "@/state";
import { Card, CardGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { DrawChest } from "./DrawChest";
import { useSendActionSocket } from "@/hooks/useSendActionSocket";

export const Chests: React.FC = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { chests } = botState

  const sendAction = useSendActionSocket()

  const deleteChest = (key: string) => {
    if (window.confirm("Confirm delete chest?") === true) {
      const newChests = { ...chests }
      delete newChests[key]
      sendAction('setChests', newChests)
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Chests</Card.Title>
          <Card.Text>Contain all chests in memory of server</Card.Text>
          <CardGroup>
            {Object.entries(chests).map((entry) => {
              const key = entry[0]
              const chest = entry[1]
              console.log({ chest })
              return <DrawChest key={key} uuid={key} chest={chest} deleteChest={() => deleteChest(key)} />;
            })}
          </CardGroup>
        </Card.Body>
      </Card>
    </>
  );
};
