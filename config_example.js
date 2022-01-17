const config = {
  server: '127.0.0.1', // Minecraft Server
  port: '25565', // Minecraft Port
  masters: [{ name: 'PlayerName' }, { name: 'SecondPlayerName' }], // Is requeried for manage the bot in game, offline mode
  webServer: 'http://minecraftlegionwebserver', // host minecraftLegionWebServer Web
  webServerPort: '4001', // minecraftLegionWebServer PORT
  webServerPassword: 'admin', // password for websocket
  debugMode: false,
  customStart: false,
  autoRestart: true
}
module.exports = config
