import { items, foods } from "@/utils/mcData";

type ItemType = {
  id: number,
  name: string,
  stackSize: number,
  displayName: string,
}

type FoodType = ItemType &{
  foodPoints: number,
  saturation: number,
  effectiveQuality: number,
  saturationRatio: number
}

export type ItemOption = {
  value: ItemType,
  label: string,
}

export type FoodOption = {
  value: FoodType,
  label: string,
}

const plants = [
  'carrot',
  'potato',
  'beetroot',
  'wheat',
  'melon',
  'sweet_berries',
  'pumpkin',
  'oak_sapling',
  'cabirch_saplingrrot',
  'jungle_sapling',
  'acacia_sapling',
  'dark_oak_sapling',
  'spruce_sapling',
  'cactus',
  'bamboo',
  'sugar_cane',
]

export const plantOptions = (inputValue: string): Promise<Array<ItemOption>> => {
  return new Promise((resolve) => {
    const filter = items
      .filter((i) =>
        plants.includes(i.name) &&
        (i.displayName.toLowerCase().includes(inputValue.toLowerCase()) || i.name.toLowerCase().includes(inputValue.toLowerCase()))
      )
      .slice(0, 10)
      .map((item) => ({ value: item, label: item.displayName }))

    resolve(filter)
  })
}

export const itemOptions = (inputValue: string): Promise<Array<ItemOption>> => {
  return new Promise((resolve) => {
    const filter = items
      .filter((i) => i.displayName.toLowerCase().includes(inputValue.toLowerCase()) || i.name.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 10)
      .map((item) => ({ value: item, label: item.displayName }))

    resolve(filter)
  })
}

export const foodsOptions = (inputValue: string): Promise<Array<FoodOption>> => {
  return new Promise((resolve) => {
    const filter = foods
      .filter((i) => i.displayName.toLowerCase().includes(inputValue.toLowerCase()) || i.name.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 10)
      .map((item) => ({ value: item, label: item.displayName }))

    resolve(filter)
  })
}