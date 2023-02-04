import { mcData } from "../../utils/mc";

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
  type: 'all' | 'foods' | 'plants',
  item: string
}

const ItemsAviable = (props: Props) => { // TODO change to differents methos
  const renderBlocks = () => {
    let type
    switch (props.type) {
      case 'all':
        type = mcData.itemsArray
        break
      case 'foods':
        type = mcData.foodsArray
        break
      case 'plants':
        type = plants
        break
      default:
        type = mcData.itemsArray
        break
    }

    const matchRegularExpression = new RegExp(props.item, 'gi')

    const items = type.filter(itemIndex => {
      return itemIndex.displayName.match(matchRegularExpression)
    })

    if (items.length > 10) {
      items.splice(0, items.length - 10)
    }

    return items.map((item, index) => {
      return <option key={index} value={item.name}>{item.displayName}</option>
    })
  }

  return (
    <>
      {renderBlocks()}
    </>
  )
}

export default ItemsAviable
