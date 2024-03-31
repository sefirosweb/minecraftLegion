import React, { useContext, useEffect, useState } from "react";
import { useStore } from "@/hooks/useStore";

export const ProcessList: React.FC = () => {
  const [socket] = useStore(state => [state.socket])
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    // pending to fix
    socket?.on('receiveDirectMessage', ({ type, message }: { type: string, message: Array<string> }) => {
      if (type !== 'current_events') return
      setEvents(message)
    });

    return () => {
      socket?.off("receiveDirectMessage");
    }
  }, [setEvents])

  return (
    <>
      <h4>List of all events used by bot</h4>
      <div className='border border-warning'>
        <ul>
          {events.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    </>
  )
}