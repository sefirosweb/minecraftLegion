module.exports = {
  plants: {
    carrot: { plantName: 'carrots', type: 'normal', seed: 'carrot', age: 7, craftedBy: null },
    potato: { plantName: 'potatoes', type: 'normal', seed: 'potato', age: 7, craftedBy: null },
    beetroot: { plantName: 'beetroots', type: 'normal', seed: 'beetroot_seeds', age: 3, craftedBy: null },
    wheat: { plantName: 'wheat', type: 'normal', seed: 'wheat_seeds', age: 7, craftedBy: null },
    sweet_berries: { plantName: 'sweet_berry_bush', type: 'sweet_berries', seed: 'sweet_berries', age: 3, craftedBy: null },
    melon: { plantName: 'melon', type: 'melon', seed: 'melon_seeds', age: null, craftedBy: 'melon_slice' },
    pumpkin: { plantName: 'pumpkin', type: 'melon', seed: 'pumpkin_seeds', age: null, craftedBy: 'pumpkin' },
    oak_sapling: { plantName: 'oak_sapling', type: 'tree', seed: 'oak_sapling', age: null, craftedBy: null },
    birch_sapling: { plantName: 'birch_sapling', type: 'tree', seed: 'birch_sapling', age: null, craftedBy: null },
    jungle_sapling: { plantName: 'jungle_sapling', type: 'tree', seed: 'jungle_sapling', age: null, craftedBy: null },
    acacia_sapling: { plantName: 'acacia_sapling', type: 'tree', seed: 'acacia_sapling', age: null, craftedBy: null },
    dark_oak_sapling: { plantName: 'dark_oak_sapling', type: 'tree', seed: 'dark_oak_sapling', age: null, craftedBy: null },
    cactus: { plantName: 'cactus', type: 'sapling', seed: 'cactus', age: null, craftedBy: null }
  },

  harvestMode: {
    massive: ['normal', 'sweet_berry_bush', 'melon', 'sapling'],
    onebyone: ['tree']
  }
}
