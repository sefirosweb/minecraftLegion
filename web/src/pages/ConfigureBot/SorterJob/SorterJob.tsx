import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { ChestArea } from './ChestArea'
import { BotSelectedContext } from "../ConfigurationContext";
import { Layer } from 'base-types';

export const SorterJob: React.FC = () => {
  const { botConfig, updateConfig } = useContext(BotSelectedContext);

  const handleInsertNewChestArea = () => {
    const newChestAreas = structuredClone(botConfig.chestAreas)
    newChestAreas.push({
      uuid: uuidv4(),
      xEnd: 0,
      xStart: 0,
      yLayer: 0,
      zEnd: 0,
      zStart: 0
    })
    updateConfig('chestAreas', newChestAreas)
  }

  const changeChestArea = (index: number, chestArea: Layer) => {
    const newChestAreas = structuredClone(botConfig.chestAreas)
    newChestAreas[index] = chestArea
    updateConfig('chestAreas', newChestAreas)
  }

  const deleteChestArea = (index: number) => {
    const newChestAreas = structuredClone(botConfig.chestAreas)
    newChestAreas.splice(index, 1)
    updateConfig('chestAreas', newChestAreas)
  }

  return (
    <>
      <h4>Insert chest area</h4>

      {botConfig.chestAreas.map((chestArea, index) => (
        <ChestArea
          key={chestArea.uuid}
          chestArea={chestArea}
          changeChestArea={(chestArea) => changeChestArea(index, chestArea)}
          deleteChestArea={() => deleteChestArea(index)}
        />
      ))}

      <div>
        <Button variant='success' onClick={handleInsertNewChestArea}>Insert New Chest Area</Button>
      </div>
    </>
  )
}