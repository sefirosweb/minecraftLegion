## 1.0.0
* Realease a usable version
* Fixed vec3 package
* Some servers request a login or custom actions, added "custom start bot" do it your self
* Fixed movements over "Wheat"
* Fixed bugs
  * Combat events stucks the bot
* Adding sweet berries
* Refactorized some functions
  * Eat in combat
  * Custom events
* Fixed bugs with deposit chets
* Fixed bug with farming
* Added random shuffle farming area (when you have more 1 bot farming same area configuration can start for different sites)
## 0.1.9
# Added in farmerjob new plants
  * Wheat + Melon + Pumpkin
  * Added all sapling trees
## 0.1.8
* Fixed small bug with inventory viewer
* added script: npm run one BotName Password
  * Used for development, use a nodemon + ignorefire
* Adding a Farmer Job!
  * First version for easy harvest (potatoes, carrots..)
## 0.1.7
* Added find chest and interect (save a home bed)
  * With command line and front end
* Adding enable / disable sprint config
* Adding enable / disable dig (!caution the bot can stucks)
* Adding reloading configuration button
* Unify botWebsocket.on(XX events) to botWebsocket.on('action')
## 0.1.6
* Added security on WebSocket with password (see config_example.js)
* Added frontend configuration!
  * Dynamic chest + added Deposit All items or "Deposit specific items" to have custom sorting chests
  * Items for getting ready
  * Configurations (select job, PVP, pickup items...)
  * Miner job config
  * Guard Job config
  * Added food dynamic and custom eat priority
* Optimize code of chests
* Dependecy updated, this fixed a lot of bug based on pathfinder and digging bugs
## 0.1.5
* Added miner job!
* Fixed some combat bugs
## 0.1.4
* Fixed some bugs
* Polymorfed function BehaviorGetReady
* Adding a minner basic function (can mine a hole)
## 0.1.3
* Updated vendor repository (mineflayer dependencys)
## 0.1.2
* Added websocket conection
* Added auto eat food
* Added chest for food
## 0.1.1
* Added sockets for communicating all bots between server
* Web logs of all bots at the same time
* Fixed combat bug when change weapon
* Optimized general code
* Added config_example.js
* Fixed bug on events
* Now is a stable version for the first job
## 0.1.0
* Start project
* Bot based on mineflayer and its dependencies
* Have different jobs / Behavior
* First Functionally Job Guard added