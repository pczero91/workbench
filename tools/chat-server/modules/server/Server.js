const { createServer } = require('net');

const server = createServer();
var sockets = [];
const PORT = process.env.PORT || 3000;

class Server {
    #server = createServer();
    constructor (port = PORT, host = 'localhost') {
        this.#server.listen(port, host, () => {
            console.log(`Chat active on ${host}:${port}!`);
        });
        this.#server.on('connection', (socket) => {
            console.log('User connected');
            sockets.push(socket);
            socket.on('data', (data) => {
                sockets.forEach((s) => {
                    s.write(data.toString());
                });
            });
            socket.on('close', (hadError) => {
                if (hadError) { console.log('Close error') }
                let index = sockets.findIndex((s) => {
                    return (s.remoteAddress === socket.remoteAddress) && 
                    (s.remotePort === socket.remotePort);
                });
                if (index !== -1) { sockets.splice(index, 1)}
                console.log('User disconnected');
                console.log(sockets.length);
            });
            socket.on('error', (err) => {
                console.log(err.message);
            });
        });
    }
}

module.exports = {
    Server
}