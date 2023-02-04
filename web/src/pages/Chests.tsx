import useGetSocket from "@/hooks/useGetSocket";
import { State } from "@/state";
import { Card, CardGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Socket } from "socket.io-client";
import DrawChest from "../components/DrawChest";

const Chests = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { chests } = botState

  const socket = useGetSocket() as Socket

  const deleteChest = (key: string) => {
    if (window.confirm("Confirm delete chest?") === true) {
      const newChests = { ...chests }
      delete newChests[key]

      socket.emit('sendAction', {
        action: 'setChests',
        value: newChests
      })
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

export default Chests