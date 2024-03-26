import { ChestArea } from './ChestArea'
import { BotSelectedContext } from "./ConfigurationContext";
import React, { useContext } from 'react';
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const SorterJob: React.FC = () => {
  const { botConfig } = useContext(BotSelectedContext);
  const changeConfig = useChangeConfig()
  const handleInsertNewChestArea = () => {
    changeConfig('insertNewChestArea', '')
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <h4>Insert chest area</h4>
          {botConfig.chestAreas.map((chestArea, index) => (
            <ChestArea key={index} id={index} chestArea={chestArea} />
          ))}
        </div>
      </div>

      <div className='row mb-5'>
        <div className='col-12'>
          <button type='button' className='btn btn-success' onClick={handleInsertNewChestArea}>Insert New Chest Area</button>
        </div>
      </div>
    </>
  )
}