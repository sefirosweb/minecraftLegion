import { Dimension_V2 } from "mineflayer";
import { Agro, Coordinates, DepositType, MineCords, tunnelType } from "./types";
import { AnimalList } from "./animals";

export const isDepositType = (value: any): value is DepositType => {
    return value === 'withdraw' || value === 'deposit' || value === 'depositAll';
}

export const isAgroType = (value: any): value is Agro => {
    return value === 'none' || value === 'pve' || value === 'pvp';
}

export const istunnel = (value: any): value is tunnelType => {
    return value === 'horizontally' || value === 'vertically';
}

export const isCoordinates = (value: any): value is Coordinates => {
    return value === 'x+' || value === 'x-' || value === 'z+' || value === 'z-';
}

export const isWorld = (value: any): value is Dimension_V2 => {
    return value === 'overworld' || value === 'the_end' || value === 'the_nether';
}

export const isMineCoords = (value: string): value is keyof MineCords => {
    const typesMineCord: Array<string> = ['xStart', 'xEnd', 'yEnd', 'yStart', 'zEnd', 'zStart']
    return typesMineCord.includes(value)
}

export const isAnimal = (value: string): value is keyof typeof AnimalList => {
    const animalListed = Object.keys(AnimalList)
    return animalListed.includes(value)
}