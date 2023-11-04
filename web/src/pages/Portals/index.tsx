import axios from "axios";
import { Card } from "react-bootstrap";
import { CoordsTable } from "./CoordsTable";
import { Portals as PortalsType } from "base-types";
import { useQuery } from '@tanstack/react-query'

export const Portals: React.FC = () => {
  const { data: portals } = useQuery({
    queryKey: ['portals'],
    queryFn: () => axios.get<{ portals: PortalsType }>('/api/portals').then((data) => data.data.portals),
    refetchInterval: 5000,
  })

  return (
    <>
      <Card>
        <Card.Body>
          <span className="fw-bolder fs-5">Overworld {'->'} Nether</span>
          <CoordsTable positions={portals?.overworld_to_the_nether} />

          <span className="fw-bolder fs-5">Overworld {'->'} End</span>
          <CoordsTable positions={portals?.overworld_to_the_end} />

          <span className="fw-bolder fs-5">Nether {'->'} Overworld</span>
          <CoordsTable positions={portals?.the_nether_to_overworld} />

          <span className="fw-bolder fs-5">End {'->'} Overworld</span>
          <CoordsTable positions={portals?.the_end_to_overworld} />
        </Card.Body>
      </Card>
    </>
  );
};

