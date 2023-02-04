import { State } from "@/state";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import CoordsTable from "../components/CoordsTable";
const Portals = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { portals } = botState

  return (
    <>
      <Card>
        <Card.Body>
          <h2>Overworld {'->'} Nether</h2>
          <CoordsTable positions={portals.overworld_to_the_nether} />
          <h2>Overworld {'->'} End</h2>
          <CoordsTable positions={portals.overworld_to_the_end} />
          <h2>Nether {'->'} Overworld</h2>
          <CoordsTable positions={portals.the_nether_to_overworld} />
          <h2>End {'->'} Overworld</h2>
          <CoordsTable positions={portals.the_end_to_overworld} />
        </Card.Body>
      </Card>
    </>
  );
};

export default Portals

// const mapStateToProps = (reducers) => {
//   const { botsReducer } = reducers;
//   const { portals } = botsReducer;

//   return { portals };
// };

// export default connect(mapStateToProps)(Portals);
