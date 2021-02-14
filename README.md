# minecraftLegion
Minecraft multipurpose bot

This project are based on <a target="_blank" href="https://github.com/PrismarineJS/mineflayer">mineflayer</a> & PrismarineJS repository

This program is part of the 3 of this project,
Each part can be run independently, 
The other 2 parts are <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebServer">minecraftLegionWebServer</a> & <a href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a>

I highly recomend use the other 2 parts for comunicate the bots and coordinate the actions y manage remotly

## Install:
- Install Novde version 10+
- npm i minecraftlegion

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

For run ONE bot:
node start_bot.js BotName

For use a minecraftLegionWebServer
node start

This method conencts automatically to minecraftLegionWebServer and via web you can add bots / disconnects and manage the behavior

For manage bot vía web go to <a target="_blank" href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a> for see more!


## Usage commands in chat:
First for activate the bot atention "hi namebot" or "hi all" for activate all bots at same time
* hi nameBot

Bot follow you
* come

Bot stand in the current position
* stay

Start memorize the positions, used for save the way to chests or patrol
* set start way

Save patrol used for guard job (Must bee execute first: set start way)
* set save patrol

For set max distance for attack mobs or players
* set distance 30

For set mode (pvp / pve / none), if are connected to minecraftLegionWebServer it no attack to other bots
* set mode pvp

For set job (Current only finished Guard)
* set job guard

For help other bots in combat (need use minecraftLegionWebServer)
* set help true

For finish commands
* bye

For mining xyz_start  xyz_end  start_horientantion  vertically / horizontalle
set miner x y z x y z x+ horizontally

# TODO
- Make a Archer Job ( Duding how have this behavior similar as guard job? )
- Make a Farmer Job ( Placing carrots, potatoes? need to think alot )
- Make a Woodcutter Job ( Placing trees)
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Check day/night for sleep ?
- Add bed location for sleep
- Fix pathfinder mining / diggig bug

## Next version preview
### 0.1.7
- Add placing torchs
### 0.1.8
- Check some bugs with mining job when have a too many lava or water
### 0.2.0
- Add a robust documentation =P

### 0.2.1
- Think about chat commands, currently is more faster / easy with front end, but if anyone want to configure all boot via chat commands?



Please keep calm im working hard on this project :D