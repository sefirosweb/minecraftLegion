
# minecraftLegion
Minecraft multipurpose bot

This project are based on <a target="_blank" href="https://github.com/PrismarineJS/mineflayer">mineflayer</a> & PrismarineJS repository

This program is part of the 3 of this project,
Each part can be run independently, 
The other 2 parts are <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebServer">minecraftLegionWebServer</a> & <a href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a>

I recommend using the other two modules to help the bots communicate and take commands through the WebUI.

## Install:
- Install [Node.js](https://nodejs.dev/) version 14+ 
- go to the directory which you want to install into
- run `npm i minecraftlegion` on command prompt
- make a new file called config.js with the fields shown below

Edit config.js
```js
const config = {
  server: '127.0.0.1', // Minecraft Server
  port: '', // Minecraft Port
  masters: [{ name: 'PlayerName' }, { name: 'SecondPlayerName' }], // Is requeried for manage the bot in game, *offline mode
  webServer: 'http://localhost', // minecraftLegionWebServer Web - Optional
  webServerPort: '3000' // minecraftLegionWebServer PORT - Optional
}
module.exports = config
```

To run a single bot:

    node start_bot.js BotName

To use [minecraftLegionWebServer](https://github.com/coolbot123/minecraftLegionWebServer)

    node index.js

This method connects automatically to minecraftLegionWebServer, and via the web, you can add bots/disconnects and manage the behavior.

To manage bots vía web go to <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a> to see more!


## Usage of commands in chat:
First, activate the bot attention "hi namebot" or "hi all" to start all bots simultaneously.
* `hi nameBot`

Make the bot/s follow you.
* `come`

Make the bot/s stand in the current position.
* `stay`

Start memorizing the positions used to save the way to chests or patrol (get the bots to follow you around)
* `set start way`

Save patrol, used for guard job (use command `set start way` before this one)
* `set save patrol`

For set max distance to attack mobs or players
* `set distance 30`

For set mode (pvp / pve / none), if bots are connected to minecraftLegionWebServer it wont attack other bots
* `set mode pvp`

Set job (Currently only finished Guard)
* `set job guard`

To help other bots in combat (need use minecraftLegionWebServer)
* `set help true`

to finish commands
* `bye`

For mining xyz_start  xyz_end  start_horientantion  vertically / horizontalle
set miner x y z x y z x+ horizontally
# Current Jobs
- Guard
  * Do a patrol for look near enemies
- Miner
  * Make a tunel or hole
- Farmer
  * Do placing plants and sapling trees
  * Potatoes, Carrots, Wheat, Melon, Pumpkin, Sweet berries..
  * Sapling Trees -> Woodcutter
- Breeder
  * Feed animals! all types!
  * When there is surplus, sacrifice the surplus
# TODO
- Make an Archer Job ( During how to have this behavior similar to guard job? )
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Check day/night for sleep any sleep function? Add "general config" for send all bots to sleep for all jobs
- Add Job builder! based on mineflayer-builder & Schematichs
- Add Job sorter chest, have an a bot for sort all chest
- Add "store" and "share" the chest containes, and when bot need some item go to find directly, also must be update the container chest info when any bot open/close the chest and share the rest of bots
- Add placing torchs
- Check some bugs with mining job when have a too many lava or water
- Add a robust documentation =P
- Think about chat commands, currently it is faster / comfortable with the front end, but if anyone wants to configure all boot via chat commands?
- Add back guard

Please keep calm. I'm working hard on this project :D
