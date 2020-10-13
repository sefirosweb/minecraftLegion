const cp = require('child_process');
const { stdout, stdin } = require('process');

const botsToStart = [
    { username: "Guard1", portBotStateMachine: 12121, portPrismarineViewer: '', portInventory: '' },
    { username: "Archer1", portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },

    { username: "Guard2", portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
    { username: "Guard3", portBotStateMachine: '', portPrismarineViewer: '', portInventory: '' },
    /*
    { username: "Archer2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer4", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },*/
];

let i = 0;
let totalBots = botsToStart.length;

function startBots() {
    botToStart = botsToStart[i];
    i++;
    if (i <= totalBots) {
        setTimeout(() => {
            let command = 'node start_bot ' + botToStart.username + ' ' + botToStart.portBotStateMachine;
            console.log(command);
            cp.exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.log(`Error: ${err}`);
                    return;
                }

                if (stdout) {
                    console.log(`Stdout: ${stdout}`);
                }

                if (stderr) {
                    console.log(`Stderr: ${stderr}`);
                }
            });
            startBots();
        }, 1500)

    }
};

startBots();