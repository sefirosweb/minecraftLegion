
const dirtType = {
  dirt: ['dirt', 'coarse_dirt', 'grass_block', 'farmland'],
  all: ['dirt', 'coarse_dirt', 'grass_block', 'farmland'],
  farmland: ['farmland'],
  sand: ['sand']
}

module.exports = {

  plants: {
    carrot: { plantName: 'carrots', type: 'normal', seed: 'carrot', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    potato: { plantName: 'potatoes', type: 'normal', seed: 'potato', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    beetroot: { plantName: 'beetroots', type: 'normal', seed: 'beetroot_seeds', age: 3, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    wheat: { plantName: 'wheat', type: 'normal', seed: 'wheat_seeds', age: 7, craftedBy: null, marginPlant: { x: 0, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    melon: { plantName: 'melon', type: 'melon', seed: 'melon_seeds', age: null, craftedBy: 'melon_slice', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    pumpkin: { plantName: 'pumpkin', type: 'melon', seed: 'pumpkin_seeds', age: null, craftedBy: 'pumpkin', marginPlant: { x: 1, z: 0 }, plantIn: dirtType.farmland, canPlantIn: dirtType.dirt },
    sweet_berries: { plantName: 'sweet_berry_bush', type: 'sweet_berries', seed: 'sweet_berries', age: 3, craftedBy: null, marginPlant: { x: 1, z: 0 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    oak_sapling: { plantName: 'oak_sapling', type: 'tree', seed: 'oak_sapling', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    birch_sapling: { plantName: 'birch_sapling', type: 'tree', seed: 'birch_sapling', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    jungle_sapling: { plantName: 'jungle_sapling', type: 'tree', seed: 'jungle_sapling', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    acacia_sapling: { plantName: 'acacia_sapling', type: 'tree', seed: 'acacia_sapling', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    dark_oak_sapling: { plantName: 'dark_oak_sapling', type: 'tree', seed: 'dark_oak_sapling', age: null, craftedBy: null, marginPlant: { x: 1, z: 1 }, plantIn: dirtType.all, canPlantIn: dirtType.all },
    cactus: { plantName: 'cactus', type: 'sapling', seed: 'cactus', age: null, craftedBy: null, marginPlant: { x: 2, z: 2 }, plantIn: dirtType.sand, canPlantIn: dirtType.sand }
  },

  harvestMode: {
    massive: ['normal', 'sweet_berry_bush', 'melon', 'sapling'],
    onebyone: ['tree']
  }
}
