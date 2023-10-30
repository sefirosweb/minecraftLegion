//@ts-nocheck
import ChestArea from './ChestArea'
import { BotSelectedContext } from "./ConfigurationContext";
import { useContext } from 'react';
import { useChangeConfig } from '@/hooks/useChangeConfig';

export const SorterJob = () => {
  const botConfig = useContext(BotSelectedContext);

  const changeConfig = useChangeConfig()

  const handleInsertNewChestArea = () => {
    changeConfig('insertNewChestArea', '')
  }

  const renderChestArea = () => {
    return botConfig.config.chestAreas.map((chestArea, index) => {
      return (
        <ChestArea key={index} id={index} chestArea={chestArea} />
      )
    })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <h4>Insert chest area</h4>
          {renderChestArea()}
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