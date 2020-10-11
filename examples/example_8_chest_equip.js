const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
    console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
    process.exit(1)
}

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'chest',
    password: process.argv[5]
})

let mcData
bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})

bot.on('spawn', openChest);

function openChest() {
    let chestToOpen = bot.findBlock({
        matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
        maxDistance: 6
    });

    if (!chestToOpen) {
        bot.chat('no chest found')
        setTimeout(openChest, 2000);
        return;
    }

    let chest;
    if (!checkImReady()) {
        chest = bot.openChest(chestToOpen);

        chest.on('open', () => {
            getItemsFromChest()
                .then(() => {
                    chest.close();
                })
        })


        chest.on('close', () => {
            setTimeout(() => {
                equipAllItems()
                    .then(() => {
                        bot.chat('Ready to fight!');
                    })
            }, 1000);
        })
    }

    function checkImReady() {
        if (countItemsInInventoryOrEquipped('sword') == 0)
            return false
        if (countItemsInInventoryOrEquipped('shield') == 0)
            return false
        if (countItemsInInventoryOrEquipped('bow') == 0)
            return false
        if (countItemsInInventoryOrEquipped('arrow') <= 64)
            return false

        if (countItemsInInventoryOrEquipped('helmet') == 0)
            return false
        if (countItemsInInventoryOrEquipped('chest') == 0)
            return false
        if (countItemsInInventoryOrEquipped('leggings') == 0)
            return false
        if (countItemsInInventoryOrEquipped('boots') == 0)
            return false

        return true;
    }

    function getItemsFromChest() {
        return new Promise((resolve, reject) => {
            withdrawItem('sword', 1)
                .then(() => {
                    return withdrawItem('helmet', 1);
                })
                .then(() => {
                    return withdrawItem('chest', 1);
                })
                .then(() => {
                    return withdrawItem('leggings', 1);
                })
                .then(() => {
                    return withdrawItem('boots', 1);
                })
                .then(() => {
                    return withdrawItem('shield', 1);
                })
                .then(() => {
                    return withdrawItem('bow', 1);
                })
                .then(() => {
                    return withdrawItem('arrow', 128);
                }).then(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                })
        });
    }

    function equipAllItems() {
        return new Promise((resolve, reject) => {
            equipItem('helmet')
                .then(() => {
                    return equipItem('chest');
                })
                .then(() => {
                    return equipItem('leggings');
                })
                .then(() => {
                    return equipItem('boots');
                })
                .then(() => {
                    return equipItem('shield');
                })
                .then(() => {
                    resolve();
                })
        });
    }

    function equipItem(itemArmor) {
        return new Promise((resolve, reject) => {
            if (checkItemEquiped(itemArmor)) {
                resolve();
                return;
            }

            let armor = bot.inventory.items().find(item => item.name.includes(itemArmor));

            if (!armor) {
                resolve();
                return;
            }

            let location;
            switch (itemArmor) {
                case 'helmet':
                    location = 'head';
                    break
                case 'chest':
                    location = 'torso';
                    break
                case 'leggings':
                    location = 'legs';
                    break
                case 'boots':
                    location = 'feet';
                    break
                case 'sword':
                    location = 'hand';
                    break
                case 'shield':
                    location = 'off-hand';
                    break
            }
            bot.equip(armor, location, () => {
                resolve();
            });
        });
    }

    function withdrawItem(item, amount) {
        return new Promise((resolve, reject) => {
            const currentItems = countItemsInInventoryOrEquipped(item);
            amount -= currentItems;
            if (amount <= 0) {
                resolve();
                return;
            }

            let foundItem = chest.items().find(itemtoFind => itemtoFind.name.includes(item));
            if (!foundItem) {
                bot.chat('No item ' + item + ' in chest!');
                resolve();
                return;
            }

            chest.withdraw(foundItem.type, null, amount, () => {
                resolve();
            })

        });
    }


    function countItemsInInventoryOrEquipped(item) {
        let currentItems = 0;

        if (checkItemEquiped(item)) {
            currentItems++;
        }

        currentItems += countItemsInInventory(item);
        return currentItems;
    }

    function countItemsInInventory(itemToCount) {
        let currentItems = bot.inventory.items().filter(item => item.name.includes(itemToCount));
        currentItems = currentItems.map(x => x['count']);
        currentItems = currentItems.reduce((total, num) => { return total + num }, 0);
        return currentItems
    }

    function checkItemEquiped(itemArmor) {
        let slotID;
        switch (itemArmor) {
            case 'helmet':
                slotID = 5;
                break
            case 'chest':
                slotID = 6;
                break
            case 'leggings':
                slotID = 7;
                break
            case 'boots':
                slotID = 8;
                break
            case 'shield':
                slotID = 45;
                break
            default:
                return false;
        }
        return bot.inventory.slots[slotID] !== null;
    }
}