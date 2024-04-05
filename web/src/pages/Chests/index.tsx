import React, { useEffect, useState } from "react";
import { Card, CardGroup } from "react-bootstrap";
import { Chests as ChestsType } from "base-types";
import axios from "axios";
import { useStore } from "@/hooks/useStore";
import { DrawChest } from "./DrawChest";

export const Chests: React.FC = () => {
  const [chests, setChests] = useState<ChestsType>({});
  const [socket] = useStore(state => [state.socket])

  useEffect(() => {
    socket?.on('action', ({ type, value }: { type: string, value: ChestsType }) => {
      if (type !== 'getChests') return;
      setChests(value)
    });

    socket?.emit('sendAction', {
      action: 'getChests',
      value: ''
    });

    return () => {
      socket?.off("action");
    }
  }, [setChests])

  const deleteChest = (uuid: string) => {
    axios.delete(`/api/chest/${uuid}`)
  }

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Chests</Card.Title>
          <Card.Text>Contain all chests in memory of server</Card.Text>
          <CardGroup>
            {chests && Object.entries(chests).map((entry) => {
              const key = entry[0]
              const chest = entry[1]
              return <DrawChest key={key} uuid={key} chest={chest} deleteChest={() => deleteChest(key)} />;
            })}
          </CardGroup>
        </Card.Body>
      </Card>
    </>
  );
};
