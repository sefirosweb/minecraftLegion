const config = {
  server: '127.0.0.1', // Minecraft Server
  port: '', // Minecraft Port
  masters: [{ name: 'PlayerName' }, { name: 'SecondPlayerName' }], // Is requeried for manage the bot in game, offline mode
  webServer: 'http://localhost', // minecraftLegionWebServer Web
  webServerPort: '4001', // minecraftLegionWebServer PORT
  webServerPassword: 'admin', // password for websocket
  debugMode: false,
  customStart: false,
  autoRestart: true
}
module.exports = config
