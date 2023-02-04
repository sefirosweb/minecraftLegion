export const dirtType = {
  dirt: ['dirt', 'coarse_dirt', 'grass_block', 'farmland'],
  dirtCanBefertilized: ['dirt', 'coarse_dirt', 'grass_block'],
  bamboo: ['dirt', 'coarse_dirt', 'grass_block', 'sand', 'podzol'],
  farmland: ['farmland'],
  sand: ['sand']
}

export const dirtCanBefertilized = dirtType.dirtCanBefertilized

export type Plant = {
  plantName: string,
  seed: string,
  type: 'normal' | 'melon' | 'tree' | 'sapling' | 'sweet_berries'
  harvestMode: 'massive' | 'onebyone',
  age: number | null,
  craftedBy: string | null,
  marginPlant: {
    x: number,
    z: number
  },
  plantIn: typeof dirtType[keyof typeof dirtType],
  canPlantIn: typeof dirtType[keyof typeof dirtType],
}

export type Plants = Record<string, Plant>

export const plants: Plants = {
  carrot: { plantName: 'carrots', type: 'normal', seed: 'carrot', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  potato: { plantName: 'potatoes', type: 'normal', seed: 'potato', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  beetroot: { plantName: 'beetroots', type: 'normal', seed: 'beetroot_seeds', harvestMode: 'massive', age: 3, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  wheat: { plantName: 'wheat', type: 'normal', seed: 'wheat_seeds', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  melon: { plantName: 'melon', type: 'melon', seed: 'melon_seeds', harvestMode: 'massive', age: null, craftedBy: 'melon_slice', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  pumpkin: { plantName: 'pumpkin', type: 'melon', seed: 'pumpkin_seeds', harvestMode: 'massive', age: null, craftedBy: 'pumpkin', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
  sweet_berries: { plantName: 'sweet_berry_bush', type: 'sweet_berries', seed: 'sweet_berries', harvestMode: 'massive', age: 3, craftedBy: null, marginPlant: { x: 1, z: 0 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  oak_sapling: { plantName: 'oak_sapling', type: 'tree', seed: 'oak_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  birch_sapling: { plantName: 'birch_sapling', type: 'tree', seed: 'birch_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  jungle_sapling: { plantName: 'jungle_sapling', type: 'tree', seed: 'jungle_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  acacia_sapling: { plantName: 'acacia_sapling', type: 'tree', seed: 'acacia_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  dark_oak_sapling: { plantName: 'dark_oak_sapling', type: 'tree', seed: 'dark_oak_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  spruce_sapling: { plantName: 'spruce_sapling', type: 'tree', seed: 'spruce_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.dirt, canPlantIn: dirtType.dirt },
  cactus: { plantName: 'cactus', type: 'sapling', seed: 'cactus', harvestMode: 'massive', age: null, craftedBy: null, marginPlant: { x: 2, z: 2 }, plantIn: dirtType.sand, canPlantIn: dirtType.sand },
  bamboo: { plantName: 'bamboo', type: 'sapling', seed: 'bamboo', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.bamboo, canPlantIn: dirtType.bamboo },
  sugar_cane: { plantName: 'sugar_cane', type: 'sapling', seed: 'sugar_cane', harvestMode: 'massive', age: null, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.bamboo, canPlantIn: dirtType.bamboo }
}

