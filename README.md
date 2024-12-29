# MinecraftLegion

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
  - Make a tunnel or hole
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

# Installation

## Manual:

1. Clone or download the repositorio `git clone https://github.com/sefirosweb/minecraftLegion.git && cd minecraftLegion/`
2. Auto Install all the dependencies and build them `npm run build`
3. Go to server folder and create `.env` file with password

Example:
```
SERVER=localhost
PORT=25565
MASTERS=player1,player2
WEB_SERVER=http://localhost
WEB_SERVER_PORT=4001
WEB_SERVER_PASSWORD=admin
DEBUG_MODE=false
CUSTOM_START=false
AUTO_RESTART=true
ENVIRONMENT=prod
```

To update the bot execute ```git pull``` and ```npm run build```

4. Start all: `npm start`

## With docker

Create .yml file and pull the container

Example of docker-compose.yml file:
```yml
version: "3"
services:
  app:
    image: ghcr.io/sefirosweb/minecraft-legion:latest
    environment:
      SERVER: host.docker.internal # Minecraft Server // "localhost" in reality is host.docker.internal 
      PORT: 25565 # Minecraft Port
      MASTERS: player1,player2 # Names of master players, separated with comma
      WEB_SERVER_PASSWORD: admin # Password to login into front end
      AUTO_RESTART: true # If bot crashes they auto reload again
      CUSTOM_START: false # If you want to do some actions before start bot, you can put here your own custom.js file (used for logging into servers)
      SECRET_TOKEN: input_here_random_text # This token is used to encrypt your session, must be randomnly and dont share it

    volumes:
      - "./botConfig:/app/core/botConfig" # Folder on saved bot configuration
      - "./custom_start:/app/core/custom_start" # Folder is execute custom start before start bot
      - "./db:/app/db" # This file stored session info and all bot config

    ports:
      - "80:80" # Web port
      - "4500-4550:4500-4550" # Ports used to attach viewers



```
## Need to do actions before start bot?
If you need to do some actions before start bot for example login, or move into some hall you can do this:

1º) In .env file change to true the variable: `CUSTOM_START`

2º) On start bot they create automatically a folder with file: `custom_start\custom.js`

There put all you need to do before bot starts, the function "starts" must be return a promise, when the promise is resolve all bot behavior configuration will be started


# TODO

- Optimize Sorter Job, need too many interaction with chests for sort all the items
- Add custom Sort Items in chest, based on... any idea?
- Add more behavior into Sorter Job, -> Craft items? if detect in chests no have enough of XXX items then craft it if they can? (Example swords?)
- Make an Archer Job ( During how to have this behavior similar to guard job? )
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Add Job builder! based on mineflayer-builder & Schematichs
- Add placing torchs
- Check some bugs with mining job when have a too many lava or water
- Add bodyguards

Please keep calm. I'm working hard on this project :D

# Develop

1. Start devcontainer and open workspace

2. Clone or download the repositorio 
```bash 
git clone https://github.com/sefirosweb/minecraftLegion.git && cd minecraftLegion/
```
3. Copy enviorement file 

```bash 
cp .env_example .env
```

4. Auto Install all the dependencies and build them 
```bash
npm run build
```
5. Start test server:
```bash	
npm run server
```
6. Start backend web server:
```bash
cd server && npm run start
```
7. Start frontend web server:
```bash
cd web && npm run dev
```
8. Start bot:
```bash
cd core && npm run one Guard
```