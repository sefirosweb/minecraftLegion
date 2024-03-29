import { BotSelectedContext } from "./ConfigurationContext";
import React, { useContext } from "react";

export const ProcessList: React.FC = () => {
  const botConfig = useContext(BotSelectedContext);

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <h4>List of all events used by bot</h4>
          <div className='border border-warning'>
            <ul>
              {botConfig.events.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}