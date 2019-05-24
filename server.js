const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', 5000);
app.use(express.static('public'));

// app.get('/', function(request, response) {
//     response.sendFile(path.join(__dirname, '/index.html'))
// })

server.listen(5000, function() {console.log('server listen on p:5000')})

const playersConnected = [null, null];

io.on('connection', function(socket){
    let playerIndex = -1;
    for (var i in playersConnected) {
        if (playersConnected[i] === null) {
            playerIndex = i;
        }
    }
    // tell connecting client/player their player #
    socket.emit('player-number', playerIndex);

    if (playerIndex == -1) return;

    playersConnected[playerIndex] = socket.id

    // tell all other clients player has joined
    socket.broadcast.emit('player-connect', playerIndex);

    socket.on('action', function(data) {
        const {grid, metadata} =data;

        const move = {
            playerIndex,
            grid,
            metadata,
        };

        // tell all other clients the move made by the connected player
        socket.broadcast.emit('move', move)
    });

    socket.on('disconnect', function() {
        console.log(`Player ${playerIndex} has left the game.`);
        playersConnected[playerIndex] = null;
    })
})
