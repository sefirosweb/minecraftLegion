
const dirtType = {
  dirt: ['dirt', 'coarse_dirt', 'grass_block', 'farmland'],
  dirtCanBefertilized: ['dirt', 'coarse_dirt', 'grass_block'],
  all: ['dirt', 'coarse_dirt', 'grass_block', 'farmland'],
  bamboo: ['dirt', 'coarse_dirt', 'grass_block', 'sand'],
  farmland: ['farmland'],
  sand: ['sand']
}

module.exports = {

  plants: {
    carrot: { plantName: 'carrots', type: 'normal', seed: 'carrot', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    potato: { plantName: 'potatoes', type: 'normal', seed: 'potato', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    beetroot: { plantName: 'beetroots', type: 'normal', seed: 'beetroot_seeds', harvestMode: 'massive', age: 3, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    wheat: { plantName: 'wheat', type: 'normal', seed: 'wheat_seeds', harvestMode: 'massive', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    melon: { plantName: 'melon', type: 'melon', seed: 'melon_seeds', harvestMode: 'massive', age: null, craftedBy: 'melon_slice', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    pumpkin: { plantName: 'pumpkin', type: 'melon', seed: 'pumpkin_seeds', harvestMode: 'massive', age: null, craftedBy: 'pumpkin', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    sweet_berries: { plantName: 'sweet_berry_bush', type: 'sweet_berries', seed: 'sweet_berries', harvestMode: 'massive', age: 3, craftedBy: null, marginPlant: { x: 1, z: 0 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    oak_sapling: { plantName: 'oak_sapling', type: 'tree', seed: 'oak_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    birch_sapling: { plantName: 'birch_sapling', type: 'tree', seed: 'birch_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    jungle_sapling: { plantName: 'jungle_sapling', type: 'tree', seed: 'jungle_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    acacia_sapling: { plantName: 'acacia_sapling', type: 'tree', seed: 'acacia_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    dark_oak_sapling: { plantName: 'dark_oak_sapling', type: 'tree', seed: 'dark_oak_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    spruce_sapling: { plantName: 'spruce_sapling', type: 'tree', seed: 'spruce_sapling', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    cactus: { plantName: 'cactus', type: 'sapling', seed: 'cactus', harvestMode: 'massive', age: null, craftedBy: null, marginPlant: { x: 2, z: 2 }, plantIn: dirtType.sand, canPlantIn: dirtType.sand },
    bamboo: { plantName: 'bamboo', type: 'sapling', seed: 'bamboo', harvestMode: 'onebyone', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.bamboo, canPlantIn: dirtType.bamboo }
  },

  dirtCanBefertilized: dirtType.dirtCanBefertilized
}
