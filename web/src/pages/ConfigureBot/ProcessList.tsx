import React, { useContext, useEffect, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useParams } from "react-router";
import { BotSelectedContext } from "./ConfigurationContext";


export const ProcessList: React.FC = () => {
  const { bot } = useContext(BotSelectedContext);

  const { selectedSocketId } = useParams()
  const [socket] = useStore(state => [state.socket])
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    // pending to fix
    // socket?.on('receiveDirectMessage', ({ type, message }: { type: string, message: Array<string> }) => {
    //   if (type !== 'current_events') return
    //   setEvents(message)
    // });

    socket?.emit('sendAction', {
      action: 'action',
      socketId: selectedSocketId,
      value: {
        type: 'getProcessList'
      }
    });

    // return () => {
    //   socket?.off("receiveDirectMessage");
    // }
  }, [setEvents])

  return (
    <>
      <h4>List of all events used by bot</h4>
      <div className='border border-warning'>
        <ul>
          {bot.events.map((e, i) => (
            <li key={i}>{e}</li>
          ))}

          {/* {events.map((e, i) => (
            <li key={i}>{e}</li>
          ))} */}
        </ul>
      </div>
    </>
  )
}