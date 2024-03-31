import { LayerCoords } from '@/components';
import { Layer } from 'base-types';
import React from 'react';
import { Button } from 'react-bootstrap'

type Props = {
  chestArea: Layer,
  changeChestArea: (chestArea: Layer) => void
  deleteChestArea: () => void
}

export const ChestArea: React.FC<Props> = (props) => {
  const { chestArea, changeChestArea, deleteChestArea } = props

  return (
    <div className='p-3 mb-3 border rounded'>

      <div className='mb-3'>
        <LayerCoords
          area={chestArea}
          onChange={changeChestArea}
        />
      </div>

      <Button variant='danger' onClick={deleteChestArea}>Delete Area</Button>
    </div >

  )
}
