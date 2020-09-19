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
        //context.linewidht = 2;
        //context.moveTo(data.x, data.y)
        //context.lineTo(data.pre_x, data.pre_y);
        context.fillStyle = "#FFFFFF";
        context.fillRect(20, 20, 40, 40);
        context.stroke();
    });

    const widht = canvas.clientHeight;
    const height = canvas.clientWidth;
}


document.addEventListener('DOMContentLoaded', init());