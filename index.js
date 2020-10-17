const cp = require('child_process')

// Initzialitin express web sockets
const config = require('./config')
const express = require('express')
const app = express()
const path = require('path')
const SocketIO = require('socket.io')

// Server
app.set('port', config.webServer || 3000)

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Server
const server = app.listen(app.get('port'), () => {
  console.log('webServer on port', app.get('port'))
})

const botsConnected = [];

// Websocket server
const io = SocketIO(server)
io.on('connection', (socket) => {

  // io.sockets.emit('logs', 'New connection');

  socket.emit('getFriends', JSON.stringify(botsConnected))

  // Reciving info
  socket.on('command', (data) => {
    sendLogs(data)
  })

  socket.on('addFriend', (botName) => {
    botsConnected.push(botName)
    io.sockets.emit('getFriends', JSON.stringify(botsConnected))
    sendLogs(botName + ' loged!')
  })

})

function sendLogs(data) {
  const date = new Date();
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hour = date.getHours();
  io.sockets.emit('logs', hour + ':' + minutes + ':' + seconds + ' ' + data);
}







const botsToStart = [
  { username: 'Guard1', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  /* { username: 'Guard3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard4', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },

  { username: 'Archer1', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' }
*/
]

let i = 0
const totalBots = botsToStart.length

function startBots() {
  const botToStart = botsToStart[i]
  i++
  if (i <= totalBots) {
    setTimeout(() => {
      const command = 'node start_bot ' + botToStart.username + ' ' + botToStart.portBotStateMachine
      console.log(command)
      cp.exec(command, (err, stdout, stderr) => {
        if (err) {
          console.log(`Error: ${err}`)
          return
        }

        if (stdout) {
          console.log(`Stdout: ${stdout}`)
        }

        if (stderr) {
          console.log(`Stderr: ${stderr}`)
        }
      })
      startBots()
    }, 1500)
  }
};

startBots()