function init() {
    let socket = io.connect('http://localhost:4000', {
        forceNew: true,
    });

    const canvas = document.getElementById('drawing');
    const context = canvas.getContext('2d');

    socket.on('mensaje', function(data) {
        console.log(data);
    })

    socket.on('drawline', data => {
        context.beginPath();
        context.lineWith = 2;
        context.moveTo(data.x, data.y)
        context.lineTo(data.pre_x, data.pre_y);
        context.stroke();
    });

    const widht = "400";
    const height = "400";

    canvas.widht = widht;
    canvas.height = height;
}


document.addEventListener('DOMContentLoaded', init());