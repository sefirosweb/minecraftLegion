import { Card } from "react-bootstrap";
import { Portals as PortalsType } from "base-types";
import { useEffect, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { CoordsTable } from "./CoordsTable";

export const Portals: React.FC = () => {
  const [portals, setPortals] = useState<PortalsType>({
    overworld_to_the_end: [],
    overworld_to_the_nether: [],
    the_end_to_overworld: [],
    the_nether_to_overworld: []
  });

  const socket = useStore(state => state.socket)

  useEffect(() => {
    socket?.on('action', ({ type, value }: { type: string, value: PortalsType }) => {
      if (type !== 'getPortals') return;
      setPortals(value)
    });

    socket?.emit('sendAction', {
      action: 'getPortals',
      value: ''
    });

    return () => {
      socket?.off("action");
    }
  }, [setPortals])

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

