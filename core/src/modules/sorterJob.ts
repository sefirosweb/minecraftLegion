import { ChestTransaction, Item, Chests, ChestBlock, Slot, CorrectChests, NewChestSort } from "types/index"

const sorterJob = () => {

  const findItemsInChests = (chestInput: Chests, itemsInput: Array<Item>, exclude?: any) => {
    const chests = structuredClone(chestInput)
    const items = structuredClone(itemsInput)

    const transactions: Array<ChestTransaction> = []

    items.forEach((item) => {
      Object.entries(chests).forEach((entry) => {
        const chestIndex = entry[0]
        const chest = entry[1]
        chest.slots.every((slot, slotIndex) => {
          if (exclude && exclude[chestIndex][slotIndex].correct === true) return true
          if (item.quantity === 0) return false
          if (!slot) return true
          if (item.id) {
            if (slot.type === item.id && slot.count > 0) {
              const count = slot.count < item.quantity ? slot.count : item.quantity
              const slotCount = slot.count
              slot.count = 0
              item.quantity -= count
              transactions.push({
                fromChest: chestIndex,
                fromSlot: slotIndex,
                id: slot.type,
                name: slot.name,
                quantity: slotCount,
              })
            }
          }
          return true
        })
      })
    })

    return transactions
  }

  const sortChestVec = (a: ChestBlock, b: ChestBlock, sortBy: string, sort: string) => {
    let tempA = a
    let tempB = b
    if (sort === 'desc') {
      tempA = b
      tempB = a
    }

    if (sortBy === 'z') {
      if (tempA.position.z - tempB.position.z !== 0) {
        return tempA.position.z - tempB.position.z
      }

      if (tempA.position.x - tempB.position.x !== 0) {
        return tempA.position.x - tempB.position.x
      }

      return tempA.position.y - tempB.position.y
    }

    if (tempA.position.x - tempB.position.x !== 0) {
      return tempA.position.x - tempB.position.x
    }

    if (tempA.position.z - tempB.position.z !== 0) {
      return tempA.position.z - tempB.position.z
    }

    return tempA.position.y - tempB.position.y
  }

  const sortChests = (chestInput: Chests) => {

    const chests = structuredClone(chestInput)
    const chestPriority = Object.entries(chests).map((e) => { return { ...e[1], index: e[0] } }).sort((a, b) => sortChestVec(a, b, 'z', 'asc')).map(c => c.index)
    const allChests = Object.values(chests).map(chest => chest.slots)


    const allItems = allChests
      .reduce((items, chest) => {
        chest.forEach(item => {
          if (item === null) return
          const indexItem = items.findIndex(i => i.type === item.type)
          if (indexItem >= 0) {
            items[indexItem].count += item.count
          } else {
            items.push({ ...item })
          }
        })
        return items
      }, []).sort((a, b) => a.type - b.type)

    let chestIndex = 0
    const newChestSort: NewChestSort = {}
    let newSlots: Array<Slot> = []

    allItems.forEach(item => {
      let count = item.count

      if (newSlots.length === 0) {
        while (count > 0) {
          const itemToDeposit = { ...item }
          itemToDeposit.count = count > item.stackSize ? item.stackSize : count
          count -= itemToDeposit.count
          newSlots.push(itemToDeposit)

          if (newSlots.length === allChests[chestIndex].length) {
            newChestSort[chestPriority[chestIndex]] = newSlots
            chestIndex++
            newSlots = []
          }
        }
      } else {

        const slotNeeded = Math.ceil(count / item.stackSize)
        const freeSlots = allChests[chestIndex].length - newSlots.length

        if (slotNeeded > freeSlots) {
          newChestSort[chestPriority[chestIndex]] = newSlots
          chestIndex++
          newSlots = []
        }

        while (count > 0) {
          const itemToDeposit = { ...item }
          itemToDeposit.count = count > item.stackSize ? item.stackSize : count
          count -= itemToDeposit.count
          newSlots.push(itemToDeposit)

          if (newSlots.length === allChests[chestIndex].length) {
            newChestSort[chestPriority[chestIndex]] = newSlots
            chestIndex++
            newSlots = []
          }
        }
      }
    })

    newChestSort[chestPriority[chestIndex]] = newSlots
    return newChestSort
  }


  const calculateSlotsToSort = (chests: Chests, newChestSort: NewChestSort) => {
    const correctChests: CorrectChests = {}

    Object.entries(chests).forEach(c => {
      const [index, chest] = c

      correctChests[index] = chest.slots.map(() => { return { correct: false } })
    })

    const slotsToSort: Array<ChestTransaction> = []
    Object.entries(newChestSort).every((entry) => {
      const [chestIndex, chest] = entry

      chest.every((slot, slotIndex) => {
        if (
          !chests[chestIndex].slots[slotIndex] ||
          slot.type !== chests[chestIndex].slots[slotIndex].type ||
          slot.count !== chests[chestIndex].slots[slotIndex].count
        ) {

          slotsToSort.push({
            toChest: chestIndex,
            toSlot: slotIndex,
            id: slot.type,
            name: slot.name,
            quantity: slot.count
          })

        } else {
          correctChests[chestIndex][slotIndex].correct = true
        }
        if (slotsToSort.length < 27) return true
        return false
      })

      if (slotsToSort.length < 27) return true
      return false
    })

    return {
      correctChests,
      slotsToSort
    }
  }

  return {
    findItemsInChests,
    sortChestVec,
    sortChests,
    calculateSlotsToSort
  }
}

export default sorterJob