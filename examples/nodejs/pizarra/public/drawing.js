function init () {
  const socket = io.connect('http://localhost:4000', {
    forceNew: true
  })

  socket.on('mensaje', function (data) {
    console.log(data)
  })

  socket.on('drawline', data => {
    context.beginPath()
    context.lineWith = 2
    context.moveTo(data.x, data.y - 65)
    context.lineTo(data.pre_x, data.pre_y - 65)
    context.stroke()
  })

  const mouse = {
    click: false,
    move: false,
    pos: {
      x: 0,
      y: 0
    },
    pos_prev: {
      x: 0,
      y: 0
    }
  }

  const canvas = document.getElementById('drawing')
  const context = canvas.getContext('2d')

  const widht = '400'
  const height = '400'

  canvas.widht = widht
  canvas.height = height

  canvas.addEventListener('mousedown', (e) => {
    mouse.click = true
    mouse.pos_prev.x = e.clientX
    mouse.pos_prev.y = e.clientY
  })

  canvas.addEventListener('mouseup', (e) => {
    mouse.click = false
  })

  canvas.addEventListener('mousemove', (e) => {
    mouse.pos.x = e.clientX
    mouse.pos.y = e.clientY
    mouse.move = true
  })

  function mainLoop () {
    if (mouse.click && mouse.move && mouse.move) {
      const line = {
        x: mouse.pos.x,
        y: mouse.pos.y,
        pre_x: mouse.pos_prev.x,
        pre_y: mouse.pos_prev.y
      }

      socket.emit('drawline', line)
      mouse.pos_prev.x = mouse.pos.x
      mouse.pos_prev.y = mouse.pos.y

      mouse.move = false
    }

    setTimeout(mainLoop, 20)
  }

  mainLoop()
}

document.addEventListener('DOMContentLoaded', init())
