import { State } from "@/state";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { CoordsTable } from "./CoordsTable";

export const Portals: React.FC = () => {
  const botState = useSelector((state: State) => state.botsReducer);
  const { portals } = botState

  return (
    <>
      <Card>
        <Card.Body>
          <span className="fw-bolder fs-5">Overworld {'->'} Nether</span>
          <CoordsTable positions={portals.overworld_to_the_nether} />

          <span className="fw-bolder fs-5">Overworld {'->'} End</span>
          <CoordsTable positions={portals.overworld_to_the_end} />

          <span className="fw-bolder fs-5">Nether {'->'} Overworld</span>
          <CoordsTable positions={portals.the_nether_to_overworld} />

          <span className="fw-bolder fs-5">End {'->'} Overworld</span>
          <CoordsTable positions={portals.the_end_to_overworld} />
        </Card.Body>
      </Card>
    </>
  );
};

