const cp = require('child_process');
const { stdout, stdin } = require('process');

const botsToStart = [
    { username: "Guard1", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    /*
        { username: "Guard2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
        { username: "Guard3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
        { username: "Archer1", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
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
            let command = 'node start_guard ' + botToStart.username;
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
        }, 900)

    }
};
startBots();