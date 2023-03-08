import { AnimalList } from "types/animals"

export const isAnimal = (value: string): value is keyof typeof AnimalList => {
  const animalListed = Object.keys(AnimalList)
  return animalListed.includes(value)
}