const cp = require('child_process')
const path = require('path');

function startBot (botName, password) {
  const command = 'node ' + path.join(__dirname, 'start_bot') + ' ' + botName
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

const botsToStart = [
  { username: 'Guard1' }
  // { username: 'Guard2' },
  // { username: 'Guard3' },
  // { username: 'Archer1' },
  // { username: 'Archer2' },
  // { username: 'Archer3' }
  // { username: 'Miner' }
]

let i = 0
function runNextBot () {
  const botToStart = botsToStart[i]
  i++
  if (i <= botsToStart.length) {
    setTimeout(() => {
      startBot(botToStart.username)
      runNextBot()
    }, 3000)
  }
};

runNextBot()

// Master websocket for load bots
const { webServer, webServerPort } = require('./config')
const io = require('socket.io-client')
const socket = io(webServer + ':' + webServerPort)

socket.on('connect', () => {
  console.log('Connected to webserver')
  socket.emit('botMaster', 'on')
})

socket.on('disconnect', () => {
  console.log('disconnected from webserver')
})

socket.on('botConnect', data => {
  startBot(data.botName, data.botPassword)
})
