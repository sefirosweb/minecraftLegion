function init () {
  const socket = io.connect('http://localhost:4000', {
    forceNew: true
  })

  const canvas = document.getElementById('drawing')
  const context = canvas.getContext('2d')

  socket.on('mensaje', function (data) {
    console.log(data)
  })

  socket.on('drawline', data => {
    console.log(data)
    context.clearRect(0, 0, widht, height)
    context.beginPath()
    // context.linewidht = 2;
    // context.moveTo(data.x, data.y)
    // context.lineTo(data.pre_x, data.pre_y);
    context.fillStyle = 'red'
    context.fillRect(data.x_from, data.y_from, data.x_to, data.y_to)
    context.stroke()
  })

  const widht = canvas.clientHeight
  const height = canvas.clientWidth
}

document.addEventListener('DOMContentLoaded', init())
