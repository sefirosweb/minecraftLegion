
export enum AnimalList {
    sheep = "sheep",
    cow = "cow",
    wolf = "wolf",
    chicken = "chicken",
    cat = "cat",
    horse = "horse",
    donkey = "donkey",
    llama = "llama",
    pig = "pig",
    rabbit = "rabbit",
    turtle = "turtle",
    panda = "panda",
    fox = "fox",
    bee = "bee",
}

export type FarmAnimal = Record<keyof typeof AnimalList, number>

type Animals = Record<keyof typeof AnimalList, {
    foods: Array<string>
}>

export const animals: Animals = {
    sheep: {
        foods: ['wheat']
    },
    cow: {
        foods: ['wheat']
    },
    wolf: {
        foods: ['beef', 'chicken', 'rabbit', 'porkchop']
    },
    chicken: {
        foods: ['wheat_seeds']
    },
    cat: {
        foods: ['cod', 'salmon']
    },
    horse: {
        foods: ['golden_carrot', 'golden_apple']
    },
    donkey: {
        foods: ['golden_carrot', 'golden_apple']
    },
    llama: {
        foods: ['hay_block']
    },
    pig: {
        foods: ['carrot', 'potato', 'beetroot']
    },
    rabbit: {
        foods: ['carrot', 'golden_carrot', 'dandelion']
    },
    turtle: {
        foods: ['seagrass']
    },
    panda: {
        foods: ['bamboo']
    },
    fox: {
        foods: ['sweet_berries']
    },
    bee: {
        foods: ['dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet', 'orange_tulip', 'pink_tulip', 'red_tulip', 'white_tulip', 'cornflower', 'lily_of_the_valley', 'oxeye_daisy']
    }
}