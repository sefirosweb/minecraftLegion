const cp = require('child_process')

// Initzialitin express web sockets
const config = require('./config')
const express = require('express')
const app = express()
const path = require('path')
const SocketIO = require('socket.io')

// Server
app.set('port', config.webServerPort || 3000)

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
  // When bot logouts
  socket.on('disconnect', function () {
    const find = botsConnected.find(botConection => botConection.socketId === socket.id)
    if (find === undefined) { return }

    botsConnected.splice(botsConnected.indexOf(find), 1)

    io.sockets.emit('botsOnline', JSON.stringify(botsConnected))
    sendLogs('Disconnected', find.name)
  });

  // When bot logins
  socket.on('addFriend', (botName) => {
    const find = botsConnected.find(botConection => botConection.name === botName)
    if (find === undefined) {
      botsConnected.push({ socketId: socket.id, name: botName })
    }
    io.sockets.emit('botsOnline', JSON.stringify(botsConnected))
    sendLogs('Login', botName)
  })

  socket.on('getBotsOnline', () => {
    socket.emit('botsOnline', JSON.stringify(botsConnected))
  })

  // Reciving info
  socket.on('command', (data) => {
    sendLogs(data)
  })

  // Reciving logs
  socket.on('logs', (data) => {
    const find = botsConnected.find(botConection => botConection.socketId === socket.id)
    sendLogs(data, find.name)
  })

})

function sendLogs(data, botName = '') {
  const date = new Date();
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hour = date.getHours();
  io.sockets.emit('logs', hour + ':' + minutes + ':' + seconds + ' [' + botName + '] ' + data);
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