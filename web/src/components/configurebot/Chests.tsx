//@ts-nocheck
import { Button, Col, ListGroup, Row } from "react-bootstrap";
import FormCheck from '../forms/FormCheck';
import Chest from './Chest'
import { useSelector } from "react-redux";
import { State } from "@/state";

const Chests = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const botConfig = botsOnline.find((e) => { return e.socketId === selectedSocketId })
  if (botConfig === undefined) { return null }

  const changeConfig = (configToChange, value) => {
    if (socket) {
      socket.emit("sendAction", {
        action: "changeConfig",
        socketId: botConfig.socketId,
        value: {
          configToChange,
          value,
        },
      });
    }
  };

  const handleInsertNewChest = () => {
    changeConfig("insertNewChest", '')
  };

  const renderChests = () => {
    return botConfig.config.chests.map((chest, index) => {
      return (
        <Chest
          key={index}
          id={index}
          chest={chest}
          socketId={botConfig.socketId}
        />
      );
    });
  };

  return (
    <>
      <FormCheck
        id={"firstPickUpItemsFromKnownChests"}
        onChange={() => changeConfig("firstPickUpItemsFromKnownChests", !botConfig.config.firstPickUpItemsFromKnownChests)}
        label='Use a memorized chest first?'
        checked={botConfig.config.firstPickUpItemsFromKnownChests}
      />
      <FormCheck
        id={"canCraftItemWithdrawChest"}
        onChange={() => changeConfig("canCraftItemWithdrawChest", !botConfig.config.canCraftItemWithdrawChest)}
        label='Craft item if it is possible?'
        checked={botConfig.config.canCraftItemWithdrawChest}
      />

      <Row>
        <Col>
          <ListGroup className='mb-3'>
            <ListGroup.Item>When the bot is not ready, they go to chest to withdraw or deposit items</ListGroup.Item>
            <ListGroup.Item variant="success">Withdraw the items selected</ListGroup.Item>
            <ListGroup.Item variant="warning">Deposit: only the items selected</ListGroup.Item>
            <ListGroup.Item variant="danger">Deposit all: excluding item to deposit selected</ListGroup.Item>
            <ListGroup.Item variant="dark">(!) The priority of chest is important for deposit / withdraw items in order</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>

      {renderChests()}

      <Row className='mb-5'>
        <Col>
          <Button
            variant="success"
            onClick={handleInsertNewChest}
          >
            Insert New Chest
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Chests

// const mapStateToProps = (reducers) => {
//   const { configurationReducer, botsReducer } = reducers;
//   const { socket, selectedSocketId } = configurationReducer;
//   const { botsOnline } = botsReducer


//   return { socket, selectedSocketId, botsOnline };
// };

// const mapDispatchToProps = {
//   getBotBySocketId,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Chests);
