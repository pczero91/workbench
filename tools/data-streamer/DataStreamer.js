const fs = require('fs');

function getFileData(filePath, writeStream, startByte = 0, contentType) {
    const chunkSize = 10 ** 6;
    const fileSize = fs.statSync(filePath).size;
    const endByte = Math.min((startByte + chunkSize), (fileSize-1))
    const statusCode = ((startByte == 0) && (endByte == (fileSize-1))) ? 200 : 206;
    const contentLength = endByte - startByte + 1;
    const headers = {
        "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": contentType
    }
    writeStream.writeHead(statusCode, headers);
    let options = {
        flags: 'r',
        encoding: null,
        fd: null,
        mode: 0o666,
        autoClose: true,
        emitClose: true,
        start: startByte,
        end: endByte,
        highWaterNark: 64 * 1024,
        fs: null
    };
    let rStream = fs.createReadStream(filePath, options);
    rStream.pipe(writeStream);
}

class DataStreamer {
    static getFileData = getFileData;
}

module.exports = {
    DataStreamer
}