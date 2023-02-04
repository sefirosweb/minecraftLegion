# minecraftLegion

Minecraft multipurpose bot

This project are based on <a target="_blank" href="https://github.com/PrismarineJS/mineflayer">mineflayer</a> & <a target="_blank" href="https://github.com/PrismarineJS">PrismarineJS</a> repository

## What can does the bot?

- Can combat automatically when detect nearby enemies, he know use the weapons and bow
- Can pickup items droped
- Can plant and farm areas, including trees
- Can feed animals and buthcer them
- Can mining a chunk area of block
- Can mining and make a tunnel, including under water or lava, including in nether
- Can pickup items they need it self, specifing the chests and indicating wich items are in chest
- Can craft items itself if have necessary materials
- Can sort the chest itself
- Can do patrol in area to protect the area, they can attack to PVE & PVP
- Can sleep on night
- Can cross the portals to go to the job

All of them are based on jobs, and you must be configure with web UI

### Watch the videos so you can see what it can do for you

https://www.youtube.com/watch?v=QIz6o7cJITg&list=PLPwIRDkD3kwSdQ04LnzcGrLrlST9XoKjk&index=5

# Basic usage of commands in chat:

**There only are the basic commands for full manage you must need to use a web UI**

First, activate the bot attention "hi namebot" or "hi all" to start all bots simultaneously.

- `hi nameBot`

Make the bot/s follow you.

- `come`

Make the bot/s stand in the current position.

- `stay`

to finish commands

- `bye`

# Current Jobs

- Guard
  - Do a patrol for look near enemies
- Miner
  - Make a tunel or hole
- Farmer
  - Do placing plants and sapling trees
  - Potatoes, Carrots, Wheat, Melon, Pumpkin, Sweet berries..
  - Sapling Trees -> Woodcutter
- Breeder
  - Feed animals! all types!
  - When there is surplus, sacrifice the surplus
- Sorter Job
  - The bot search all nearest chest and they sort all items based on ID item
  - Also send to the server and other bots you have in each chest, NOW ALL BOTS GO DIRECTLY TO THE CHEST THAT STORES THE ITEM!

# TODO

- ADD Easy installation

- Optimize Sorter Job, need too many interaction with chests for sort all the items
- Add custom Sort Items in chest, based on... any idea?
- Add more behavior into Sorter Job, -> Craft items? if detect in chests no have enough of XXX items then craft it if they can? (Example swords?)
- Make an Archer Job ( During how to have this behavior similar to guard job? )
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Add Job builder! based on mineflayer-builder & Schematichs
- Add placing torchs
- Check some bugs with mining job when have a too many lava or water
- Add a robust documentation =P
- Add bodyguards

Please keep calm. I'm working hard on this project :D
