const cp = require('child_process')

const botsToStart = [
  { username: 'Guard1', portBotStateMachine: 12121, portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Guard4', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },

  { username: 'Archer1', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer2', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
  { username: 'Archer3', portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' }
  // { username: "Archer4", portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },

]

let i = 0
const totalBots = botsToStart.length

function startBots () {
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
