import React from "react";
import { Card, CardGroup } from "react-bootstrap";
import { DrawChest } from "./DrawChest";
import { useSendActionSocket } from "@/hooks/useSendActionSocket";
import { Chests as ChestsType } from "base-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const Chests: React.FC = () => {
  const { data: chests } = useQuery({
    queryKey: ['chests'],
    queryFn: () => axios.get<{ chests: ChestsType }>('/api/chests').then((data) => data.data.chests),
    refetchInterval: 2000,
  })


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
