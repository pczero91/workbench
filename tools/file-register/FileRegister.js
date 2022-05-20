const fs = require('fs');
const path = require('path');
const { FormParser } = require('./../form-parser/FormParser');

class FileRegister {

    #registerPath;
    #localFolder;

    constructor(route, registerPath = __dirname) {
        this.#localFolder = route;
        this.#registerPath = registerPath;
        getFiles(route, registerPath);
    }

    get mainFolder() {
        return path.basename(this.#localFolder);
    }

    sendFile(res, id) {
        let currentData = fs.readFileSync(path.join(this.#registerPath, '/file-database.json'), {encoding:'utf8'});
        currentData = JSON.parse(currentData);
        let index = currentData.findIndex((reg) => {
            return reg.id == id;
        });
        if (index == -1) {
            res.writeHead(404, "Not Found", {"content-type": "application/json"});
            res.end(JSON.stringify({message: "File not found!"}));
            return;
        }
        fs.readFile(path.join(currentData[index].path, currentData[index].name), (err, data) => {
            if (err) throw err;
            res.write(data);
            res.end();
        });
    }

    getDataIndex(res, callback) {
        fs.readFile(path.join(this.#registerPath, '/file-database.json'), (err, data) => {
            if (err) throw err;
            if (!callback) {
                res.writeHead(200, {"content-type": "application/json"});
                res.write(data);
                res.end();
                return;
            }
            callback(data);
        });
    }

    postFile(req, res, folder = this.mainFolder, callback = () => { res.end('Post received!'); }) {
        let directory = path.join(this.#localFolder);
        let folders = JSON.parse(fs.readFileSync(path.join(this.#registerPath, '/file-database.json'), {encoding:'utf8'}));

        let index = folders.findIndex((d) => {
            return d.extension == 'dir' && d.name == folder;
        });

        if (index !== -1) {
            directory = path.join(folders[index].path, folder);
        }
        console.log(directory);
        getPostDataStream(req, (data, file, start) => {
            let flag = 'a';
            if (start) {
                flag = 'w';
            }
            fs.writeFileSync(path.join(directory, file), data, { flag: flag });
        },
        () => {
            callback();
            getFiles(this.#localFolder, this.#registerPath);
        });
    }
}

function getFiles(route, registerPath, next = false) {
    let flag = 'w';
    fs.readdir(route, (err, files) => {
        if (err) throw err;
        let dirs = [];
        files.forEach((f, ind) => {
            let [, ext] = f.split('.');
            if (ext == undefined) {
                dirs.push(path.join(route, f));
            }
            if (ind > 0) {
                currentData = fs.readFileSync(path.join(registerPath, '/file-database.json'), {encoding:'utf8'});
            } else if (next) {
                currentData = fs.readFileSync(path.join(registerPath, '/file-database.json'), {encoding:'utf8'});
            } else {
                currentData = '[]';
            }
            currentData = JSON.parse(currentData);
            if (ext !== 'uploadedData') {
                currentData.push({
                    id: idGen(currentData.length),
                    name: f,
                    extension: (ext) ? ext : 'dir',
                    path: route
                });
            }
            fs.writeFileSync(path.join(registerPath, '/file-database.json'), JSON.stringify(currentData), { flag: flag });
        });
        if (dirs.length > 0) {
            dirs.forEach((d) => {
                getFiles(d, registerPath, true);
            });
        }
    });
}

function idGen(counter = 0) {
    return counter.toString(16);
}

function getPostDataStream(req, callback, completed) {
    let data = new FormParser(req);
    let start = false;
    let currentFile = '';
    req.on('data', (chunk) => {
        data.getData(chunk, (byte, file) => {
            if (file !== currentFile) {
                start = true;
                currentFile = file;
            }
            callback(byte, file, start)
            start = false;
        });
    });
    req.on('end', () => {
        completed();
    });
}

module.exports = {
    FileRegister
}