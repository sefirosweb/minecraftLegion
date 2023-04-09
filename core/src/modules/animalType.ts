import { AnimalList } from "base-types"

export const isAnimal = (value: string): value is keyof typeof AnimalList => {
  const animalListed = Object.keys(AnimalList)
  return animalListed.includes(value)
}