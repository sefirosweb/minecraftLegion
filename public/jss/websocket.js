const socket = io()

let textAreaLogs = document.getElementById('textAreaLogs')
let inputCommandText = document.getElementById('inputCommandText')
let sendCommandButton = document.getElementById('sendCommandButton')

socket.on('logs', (data) => {
    textAreaLogs.append(data + '\r\n')
    textAreaLogs.scrollTop = textAreaLogs.scrollHeight;
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