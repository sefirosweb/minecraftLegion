# minecraftLegion

Minecraft multipurpose bot

This project are based on <a target="_blank" href="https://github.com/PrismarineJS/mineflayer">mineflayer</a> & PrismarineJS repository

This program is part of the 3 of this project,
Each part can be run independently,
The other 2 parts are <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebServer">minecraftLegionWebServer</a> & <a href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a>

I recommend using the other two modules to help the bots communicate and take commands through the WebUI.

## Watch the videos so you can see what it can do for you
https://www.youtube.com/watch?v=QIz6o7cJITg&list=PLPwIRDkD3kwSdQ04LnzcGrLrlST9XoKjk&index=5

## Install with docker

1. You need to have installed [docker](https://docs.docker.com/desktop/windows/wsl/), you can go to official docker site and follow the installation guide for you OS
2. Create docker network if you have all services in same computer and if you not have already created

```
docker network create minecraftLegionNetwork
```

3. Clone the repository

```
git clone https://github.com/sefirosweb/minecraftLegion.git
cd minecraftLegion
```

4. Copy and edit the config.ts file

```js
 cp config_example.ts config.ts

 const config = {
  server: '127.0.0.1', // Minecraft Server
  port: '25565', // Minecraft Port
  masters: [{ name: 'PlayerName' }, { name: 'SecondPlayerName' }], // Optional when front end is not opened
  webServer: 'http://minecraftlegionwebserver', // host minecraftLegionWebServer Web, if is in docker locak you must use a default config
  webServerPort: '4001', // minecraftLegionWebServer PORT
  webServerPassword: 'admin', // password for websocket
  debugMode: false,
  customStart: false, // If server have a login or other system to play you can add your self start Ex: login pass pass (see custom_start/custom_example.ts)
  autoRestart: true // When bot breaks they auto reconnect
}
module.exports = config

```

5. Start docker with node

```
docker run --rm -it --name minecraftLegion  --network minecraftLegionNetwork -v $PWD:/home/app -w /home/app -u node -p 4500-4550:4500-4550 -p 9229:9229 node:16.13-bullseye /bin/bash
```

6. Install dependencies

```
npm install
```

7. Start connection to server

```
node index.js
```

Now you can manage the bots via front end

Click on Load New Bot and select name (password is not working for now)

For download and install frontend go to <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a>

![image](https://raw.githubusercontent.com/sefirosweb/minecraftLegion/master/docs/LoadBot.png)

## Next usages
For start again the bot only you need to start docker and start the node:
```
docker run --rm -it --name minecraftLegion  --network minecraftLegionNetwork -v $PWD:/home/app -w /home/app -u node -p 4500-4550:4500-4550 -p 9229:9229 node:16.13-bullseye /bin/bash
```

```
node index.js
```

## Manual update
You need to "pull" the new code and install the new dependencies

```
git pull
```
Start docker:

```
docker run --rm -it --name minecraftLegion  --network minecraftLegionNetwork -v $PWD:/home/app -w /home/app -u node -p 4500-4550:4500-4550 -p 9229:9229 node:16.13-bullseye /bin/bash
```
Install new dependencies:
```
npm install
```
Start bot
```
node index.js
```

# Usage of commands in chat:

**There only are the basic comands for full manage you must need to use a front end <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a>**

First, activate the bot attention "hi namebot" or "hi all" to start all bots simultaneously.

- `hi nameBot`

Make the bot/s follow you.

- `come`

Make the bot/s stand in the current position.

- `stay`

Start memorizing the positions used to save the way to chests or patrol (get the bots to follow you around)

- `set start way`

Save patrol, used for guard job (use command `set start way` before this one)

- `set save patrol`

For set max distance to attack mobs or players

- `set distance 30`

For set mode (pvp / pve / none), if bots are connected to minecraftLegionWebServer it wont attack other bots

- `set mode pvp`

Set job (Currently only finished Guard)

- `set job guard`

To help other bots in combat (need use minecraftLegionWebServer)

- `set help true`

to finish commands

- `bye`

For mining xyz_start xyz_end start_horientantion vertically / horizontalle
set miner x y z x y z x+ horizontally

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

- Optimize Sorter Job, need too many interaction with chests for sort all the items
- Add custom Sort Items in chest, based on... any idea?
- Add more behavior into Sorter Job, -> Craft items? if detect in chests no have enough of XXX items then craft it if they can? (Example swords?)
- Make an Archer Job ( During how to have this behavior similar to guard job? )
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Check day/night for sleep any sleep function? Add "general config" for send all bots to sleep for all jobs
- Add Job builder! based on mineflayer-builder & Schematichs
- Add placing torchs
- Check some bugs with mining job when have a too many lava or water
- Add a robust documentation =P
- Think about chat commands, currently it is faster / comfortable with the front end, but if anyone wants to configure all boot via chat commands?
- Add back guard
- Add "world" for the position, now the bots don't know if chest or positions is in nether / overworld / end, they breaks when is corring the portals

* Update mineflayer verion to latest

Please keep calm. I'm working hard on this project :D
