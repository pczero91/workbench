const { FormParser } = require('../FormParser');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const server = http.createServer();

server.listen(PORT, () => {
    console.log(`Server on port: ${PORT}`);
});

server.on('connection', (socket) => {
    socket.on('data', (data) => {
        // console.log(data.toString());
    });
});

server.on('request', (req, res) => {
    if (req.method == 'GET') {
        fs.readFile(path.join(__dirname, 'test.html'), (err, data) => {
            if (err) throw err;
            res.writeHead(200, {'content-type': 'text/html'});
            res.write(data);
            res.end();
        });
    } else if (req.method == 'POST') {
        let fp = new FormParser(req);
        let contentType;
        let sum = 0;
        req.on('data', (chunk) => {
            fp.getData(chunk, (bytes, file, type) => {
                sum += bytes.length;
                if (!contentType) {
                    console.log([file, type]);
                    contentType = type;
                    res.writeHead(200, {'content-type': contentType});
                }
                res.write(bytes);
            });
        });
        req.on('end', () => {
            res.end();
            console.log('End of Transmission');
        });
    }
});