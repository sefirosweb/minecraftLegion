import { items as itemsArray, foods as foodsArray } from "@/utils/mcData";
import React from "react";

const plants = [
  { displayName: 'Carrot', name: 'carrot' },
  { displayName: 'Potato', name: 'potato' },
  { displayName: 'Beetroot', name: 'beetroot' },
  { displayName: 'Wheat', name: 'wheat' },
  { displayName: 'Melon', name: 'melon' },
  { displayName: 'Sweet Berries', name: 'sweet_berries' },
  { displayName: 'Pumpkin', name: 'pumpkin' },
  { displayName: 'Oak Sapling', name: 'oak_sapling' },
  { displayName: 'Cabirch Saplingrrot', name: 'cabirch_saplingrrot' },
  { displayName: 'Jungle Sapling', name: 'jungle_sapling' },
  { displayName: 'Acacia Sapling', name: 'acacia_sapling' },
  { displayName: 'Dark Oak Sapling', name: 'dark_oak_sapling' },
  { displayName: 'Spruce Sapling', name: 'spruce_sapling' },
  { displayName: 'Cactus', name: 'cactus' },
  { displayName: 'Bamboo', name: 'bamboo' },
  { displayName: 'Sugar Cane', name: 'sugar_cane' },
]
type Props = {
  type?: 'all' | 'foods' | 'plants',
  item: string
}

export const ItemsAviable: React.FC<Props> = (props) => { // TODO change to differents methos
  let type
  switch (props.type) {
    case 'all':
      type = itemsArray
      break
    case 'foods':
      type = foodsArray
      break
    case 'plants':
      type = plants
      break
    default:
      type = itemsArray
      break
  }

  const matchRegularExpression = new RegExp(props.item, 'gi')
  const items = type.filter(itemIndex => itemIndex.displayName.match(matchRegularExpression))

  if (items.length > 10) {
    items.splice(0, items.length - 10)
  }

  return items.map((item, index) => <option key={index} value={item.name}>{item.displayName}</option>)
}
