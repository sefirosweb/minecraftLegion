const cp = require('child_process')

const botsToStart = [
  { username: 'Guard1', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer1', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' }
]

let i = 0
const totalBots = botsToStart.length

function startBot(botName, password) {
  const command = 'node start_bot ' + botName
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
}

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
    }, 3000)
  }
};

// startBots()



// Master websocket for load bots
const { webServer, webServerPort } = require('./config')
const io = require("socket.io-client")
const socket = io(webServer + ':' + webServerPort);

socket.on('connect', () => {
  console.log('Connected to webserver');
  socket.emit('botMaster', 'on')
});

socket.on('disconnect', () => {
  console.log('disconnected from webserver');
})

socket.on('botConnect', data => {
  startBot(data.botName, data.botPassword)
})