type ArrayOfBlocks = {
  [key: string]: Block
}

type Item = {
  name: string
  quantity: number
}

type HaveMaterials = 'all' | 'none' | 'some'


type ResultItemPickup = {
  haveMaterials: HaveMaterials
  itemToPickup: any// TODO
  needCraftingTable: boolean
  recipesFound: boolean
  recpiesUsed: any// TODO
  resumeInventory: any// TODO
  sharedChests: any// TODO
}

type GetItemsToPickUp = {
  recipesFound: boolean,
  needCraftingTable: boolean | null,
  haveMaterials: HaveMaterials | null
  itemToPickup: Array<ChestMovement> | null
  repicesUsed: Array<Recpie> | null
  sharedChests: ArrayOfBlocks | null
  resumeInventory: Array<ItemRecipe> | null
}

type ChestMovement = {
  fromChest: string
  fromSlot: string
  quantity: number
  type: number
  name?: string
}

type ItemWithPickup = Item & {
  resultItemToPickup: Array<ResultItemPickup>
}

type ItemRecursive = {
  displayName: string
  id: number
  name: string
  stackSize: number
}

type ItemRecipe = {
  count: number
  id: number
  name: string
  type: number
  subRecipes?: Array<Recpie>
}

type ItemWithRecipe = {
  count: number
  id: number
  name: string
  type: number
  subRecipes: Array<Recpie>
}

type Recpie = {
  items: Array<ItemWithRecipe>
  result: ItemRecipe | null
  needCraftingTable?: boolean
}


type GetItemsToPickUpBatch = {
  itemsToCraft: Array<ItemWithPickup>
  needCraftingTable: boolean,
  itemToPickup: Array<any>, // TODO
  repicesUsed: Array<Recpie>,
}

type CalculateHowManyItemsCanBeCraft = {
  haveMaterials: HaveMaterials
  itemToPickup: Array<ChestMovement>,
  repicesUsed: Array<Recpie>,
  sharedChests: ArrayOfBlocks,
  resumeInventory: Array<ItemRecipe>
}

type GetItemsToPickUpRecursive = {
  itemToPickup: Array<ChestMovement>
  currentInventoryStatus: Array<any>
  sharedChests: ArrayOfBlocks
  repicesUsed: Array<Recpie>,
  recipedUsed: Recpie
}