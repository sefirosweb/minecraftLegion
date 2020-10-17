const socket = io()

let textAreaLogs = document.getElementById('textAreaLogs')
let inputCommandText = document.getElementById('inputCommandText')
let sendCommandButton = document.getElementById('sendCommandButton')
let botList = document.getElementById('botList');

// Get logs
socket.on('logs', (data) => {
    textAreaLogs.appendChild(document.createTextNode(data))
    textAreaLogs.appendChild(document.createElement("br"))
    textAreaLogs.scrollTop = textAreaLogs.scrollHeight
})

// Get online Bots
socket.emit('getBotsOnline')
socket.on('botsOnline', botsOnline => {
    let botsConnected = JSON.parse(botsOnline);

    botsConnected = botsConnected.sort(function (a, b) {
        if (a.name < b.name) { return -1; }
        if (a.name > b.firsnametname) { return 1; }
        return 0;
    })

    while (botList.firstChild) {
        botList.removeChild(botList.firstChild);
    }

    const countBots = botsConnected.length

    var li = document.createElement("li");
    li.appendChild(document.createTextNode('Bots Online (' + countBots + ')'))
    li.classList.add("list-group-item")
    li.classList.add("active")
    botList.appendChild(li);

    botsConnected.forEach(botConnected => {

        var li = document.createElement("li");
        li.appendChild(document.createTextNode(botConnected.name))
        li.setAttribute("id", botConnected.socket)
        li.classList.add("list-group-item")
        botList.appendChild(li);
    });
})


// Send command
sendCommandButton.addEventListener('click', sendCommand)
inputCommandText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendCommand()
    }
})

function sendCommand() {
    socket.emit('command', inputCommandText.value)
    inputCommandText.select()
}