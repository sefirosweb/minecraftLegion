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
    let chestToOpen;

    chestToOpen = bot.findBlock({
        matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
        maxDistance: 6
    });

    if (!chestToOpen) {
        bot.chat('no chest found')
        setTimeout(openChest, 2000);
        return;
    }

    const chest = bot.openChest(chestToOpen);

    chest.on('open', () => {
        let item;
        item = chest.items().find(item => item.name.includes('sword'));

        withdrawItem(item, 1)
            .then(() => {
                item = chest.items().find(item => item.name.includes('helmet'));
                return withdrawItem(item, 1);
            })
            .then(() => {
                item = chest.items().find(item => item.name.includes('chest'));
                return withdrawItem(item, 1);
            })
            .then(() => {
                item = chest.items().find(item => item.name.includes('leggings'));
                return withdrawItem(item, 1);
            })
            .then(() => {
                item = chest.items().find(item => item.name.includes('boots'));
                return withdrawItem(item, 1);
            })
            .then(() => {
                item = chest.items().find(item => item.name.includes('shield'));
                return withdrawItem(item, 1);
            }).then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        chest.close();
                    }, 1000);
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                });
            })
            .then(() => {
                return equipItem('helmet');
            })
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
    })

    function equipItem(itemArmor) {
        return new Promise((resolve, reject) => {
            let armor = bot.inventory.items().find(item => item.name.includes(itemArmor));
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

    function withdrawItem(item, amount, cb) {
        return new Promise((resolve, reject) => {
            chest.withdraw(item.type, null, amount, () => {
                resolve();
            })
        });
    }

}