# minecraftLegion
Minecraft multipurpose bot

This project are based on mineflayer & PrismarineJS repository

This program is part of the 3 of this project,
Each part can be run independently, 
The other 2 parts are <a href="https://github.com/sefirosweb/minecraftLegionWebServer">minecraftLegionWebServer</a> & <a href="minecraftLegionWebClient">minecraftLegionWebClient</a>

I highly recomend use the other 2 parts for comunicate the bots and coordinate the actions y manage remotly

Install: 
- Install Novde version 10+
- npm i minecraftlegion

Edit config.js
```js
const config = {
  server: '127.0.0.1', // Minecraft Server
  port: '', // Minecraft Port

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

For manage bot vía web go to <a href="https://github.com/sefirosweb/minecraftLegionWebClient">minecraftLegionWebClient</a> for see more!


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

For set the way to the chest of equipment (Must bee execute first: set start way)
* set save chest equipment

For set the way to the chest of food & arrows (Must bee execute first: set start way)
* set save chest food

For set the way to the chest of deposit extra items (mob drops) (Must bee execute first: set start way)
* set save chest deposit

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


# TODO
- Make a Archer Job (tower patrol)
- Make a Farmer Job
- Make a woodcutter Job
- Optimize combat Guard Job ( combat creepers, PVP, destroy shields)
- Check day/night for sleep ?
- Add bed location for sleep

## 0.1.1
First stable versión

please keep calm im working hard on this project :D