const { FileRegister } = require('../FileRegister');
const path = require('path');
const http  = require('http');
const fs = require('fs');

let PORT = process.env.PORT || 3000;
let rootUrl = 'http://localhost:3000/';
let mainFolder = 'server_files';
let localFolder = path.join(__dirname, mainFolder);
let registerPath = path.join(__dirname)

const fr = new FileRegister(localFolder, registerPath);

const server = http.createServer();

server.on('connection', (socket) => {
    socket.on('data', (data) => {
        // console.log(data);
    });
});

server.on('request', (req, res) => {
    let url = req.url;
    let id = '';
    let folder = '';
    let match = url.match(/\/f=(?<folder>[\w\W]+)/);
    if (match) {
        folder = match.groups.folder;
    } else {
        match = url.match(/\/(?<id>[\w\W]+)/);
        if (match) {
            id = match.groups.id;
        }
    }
    typeOfRequest(req, res, folder, id);
});

function typeOfRequest(req, res, folder, id = '') {
    switch (req.method.toLowerCase()) {
        case 'get':
            handleGet(req, res, folder, id);
            break;
        case 'post':
            handlePost(req, res, folder);
            break;
    }
}

function handleGet(req, res, folder, id) {
    let url = req.url;
    if (url == '/') {
        fr.getDataIndex(res, (data) => {
            res.writeHead(200, {"content-type": "text/html"});
            data = htmlDefaultModel(data, mainFolder, registerPath, rootUrl);
            res.write(data);
            res.end();
        });
    } else if (folder !== '') {
        fr.getDataIndex(res, (data) => {
            res.writeHead(200, {"content-type": "text/html"});
            data = htmlDefaultModel(data, folder, registerPath, rootUrl);
            res.write(data);
            res.end();
        });
    } else {
        fr.sendFile(res, id);
    }
}

function handlePost(req, res, folder) {
    fr.postFile(req, res, folder, () => {
        let html = '<!DOCTYPE html>\n';
        html += '<html>\n';
        html += '<head>\n';
        html += '<title>Upload Complete</title>\n';
        html += '<meta charset="utf-8" />\n';
        html += '</head>\n';
        html += '<body>\n';
        html += '<h1>Post Received!</h1>\n';
        html += '<a href="' + rootUrl + '/f=' + folder + '">';
        html += 'Back';
        html += '</a>\n';
        html += '</body>\n';
        html += '</html>';
        res.writeHead(200, {'content-type': 'text/html'});
        res.write(html);
        res.end();
        console.log('End of upload');
    });
}

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

function htmlDefaultModel(data, folder = '', registerPath = '', rootUrl = 'http://localhost:3000/') {
    data = JSON.parse(data.toString());
    let previousFolder;
    let folders = JSON.parse(fs.readFileSync(path.join(registerPath, '/file-database.json'), {encoding:'utf8'}));

    let index = folders.findIndex((f) => {
        return f.extension == 'dir' && f.name == folder;
    });

    if (index == -1) {
        folder = 'server_files';
    }
    let files = '';
    let dirs = '';
    let html = '<!DOCTYPE html>\n';
    html += '<html>\n';
    html += '<head>\n';
    html += '<title>Cloud Zero</title>\n';
    html += '<meta charset="utf-8" />\n';
    html += '</head>\n';
    html += '<body>\n';
    html += '<br />\n';
    html += '<form id="form-upload" enctype="multipart/form-data" method="post" action="' + rootUrl + 'f=' + folder + '">\n';
    html += '<input id="file" name="files" type="file" multiple/>';
    html += '<input type="submit" value="submit" id="submit"/>';
    html += '<br />\n';
    html += '<br />\n';
    html += '</form>\n';
    data.forEach((d) => {
        if (path.basename(d.path) !== folder) {
            return;
        }
        if (d.extension == 'dir') {
            dirs += '<a href="' + rootUrl + 'f=' + d.name + '">\n';
            dirs += d.name + '\n';
            dirs += '</a>\n';
            dirs += '<br />\n'
        } else {
            files += '<a href="' + rootUrl + d.id + '" download="' + d.name + '">\n';
            files += d.name + '\n';
            files += '</a>\n';
            files += '<br />\n'
        }
    });
    html += dirs;
    html += '<br />\n';
    html += files;
    if (index !== -1) {
        previousFolder = path.basename(folders[index].path);
        html += '<a href="' + rootUrl + 'f=' + previousFolder + '">\n';
        html += 'Back\n';
        html += '</a>\n';
    }
    html += '</body>\n';
    html += '</html>';

    return html;
}