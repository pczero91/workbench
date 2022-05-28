const { FileRegister } = require('../FileRegister');
const path = require('path');
const http  = require('http');
const fs = require('fs');

let PORT = process.env.PORT || 3000;
// let rootUrl = 'http://localhost:3000/';
let rootUrl = 'http://pedro.rocalog.com/';
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
    let match = url.match(/\/src\/(?<source>[\w\W]+)/);

    if (match) {
        let source = match.groups.source;
        let ext = path.extname(source).split('.').join('');
        let contents = {
            js: 'text/javascript',
            css: 'text/css'
        }
        res.writeHead(200, {'content-type': contents[ext]});
        res.write(fs.readFileSync(path.join(__dirname, source)));
        res.end();
        return;
    }
    
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
    } else if (url == '/sizes') {
        res.writeHead(200, {'content-type': 'application/json'});
        data = JSON.stringify(fr.fileUploadBytes);
        res.write(data);
        res.end();
    } else {
        fr.sendFile(res, id);
    }

    match = url.match(/\/bytes[\/]*/);

    if (match) {
        let bytes = fr.fileUploadBytes;
        res.writeHead(200, {'content-type': 'application/json'});
        res.write(JSON.stringify(bytes));
        res.end();
    }
}

function handlePost(req, res, folder) {
    fr.postFile(req, res, folder, () => {
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

    let template = fs.readFileSync('./test/index.html', { encoding: 'utf8' });

    let match = template.match(/<form [^>]*>/);
    if(!match) { return }

    let original = match[0];
    let modified = '<form ';
    let formParts = {};

    match = original.match(/id="(?<id>[^"]+)"/);

    if (match) { formParts.id = match.groups.id }

    match = original.match(/enctype="(?<enctype>[^"]+)"/);
    if (match) { formParts.enctype = match.groups.enctype }

    match = original.match(/method="(?<method>[^"]+)"/);
    if (match) { formParts.method = match.groups.method }

    formParts.action = rootUrl + 'f=' + folder;

    for (let key in formParts) {
        modified += key + '="' + formParts[key] + '" ';
    }

    modified += '>\r\n';

    template = template.replace(original, modified);

    let html = '';
    data.forEach((d) => {
        if (path.basename(d.path) !== folder) {
            return;
        }
        if (d.extension == 'dir') {
            dirs += '<div class="content-folder">\n';
            dirs += '<a href="' + rootUrl + 'f=' + d.name + '">\n';
            dirs += '<div>\n';
            dirs += d.name + '\n';
            dirs += '</div>\n';
            dirs += '</a>\n';
            dirs += '</div>\n';
            // dirs += '<br />\n';
        } else {
            files += '<div class="content-file">\n';
            files += '<a href="' + rootUrl + d.id + '" download="' + d.name + '">\n';
            files += '<div>\n';
            files += d.name + '\n';
            files += '</div>\n';
            files += '</a>\n';
            files += '</div>\n';
            // files += '<br />\n';
        }
    });
    html += '<div id="content-folders">\n';
    html += dirs;
    html += '</div>\n';
    html += '<div id="content-files">\n';
    html += files;
    html += '</div>\n';
    if (index !== -1) {
        previousFolder = path.basename(folders[index].path);
        html += '<a href="' + rootUrl + 'f=' + previousFolder + '">\n';
        html += 'Back\n';
        html += '</a>\n';
    }
    match = template.match(/<div id="server-content">[\r\n\s\t]*<\/div>{0,1}/);
    if(match) {
        original = match[0];
        html = '<div id="server-content">\r\n' + html + '</div>\r\n';
        template = template.replace(original, html)
    }

    return template;
}