const fs = require('fs');
const path = require('path');
const { FormParser } = require('FormParser');

class FileRegister {

    #registerPath;
    #localFolder;
    #streams = [];

    constructor(route, registerPath = __dirname) {
        this.#localFolder = route;
        this.#registerPath = registerPath;
        getFiles(route, registerPath);
    }

    get mainFolder() {
        return path.basename(this.#localFolder);
    }

    get fileUploadBytes() {
        let output = [];
        this.#streams.forEach((str) => {
            output.push({
                filename: str.filename,
                bytesWritten: str.bytesWritten
            })
        });
        return output;
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

        this.#streams = [];
        console.log('postFile');
        getPostDataStream(req, (bytes, file, type) => {
            if (file === '' || file === undefined) {
                return;
            }
            let index = this.#streams.findIndex((val) => {
                return val.filename == file;
            })
            
            if (index === -1) {
                this.#streams.push({
                    filename: file,
                    stream: fs.createWriteStream(path.join(directory, file), {flags: 'w'}),
                    bytesWritten: 0
                });
                index = this.#streams.length - 1;
                this.#streams[index].stream.write(Buffer.from({length:0}));
                this.#streams[index].stream = fs.createWriteStream(path.join(directory, file), {flags: 'a'});
            }

            this.#streams[index].stream.write(bytes);
            this.#streams[index].bytesWritten += bytes.length;
        }, () => {
            getFiles(this.#localFolder, this.#registerPath);
            callback();
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
    req.on('data', (chunk) => {
        data.getData(chunk, (bytes, file, type) => {
            callback(bytes, file, type);
        });
    });
    req.on('end', () => {
        completed();
    });
}

module.exports = {
    FileRegister
}