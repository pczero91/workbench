class FormParser {

    #contentType;
    #totalLength;    
    #input = {};

    constructor(req) {
        let match;
        this.#totalLength = req.headers['content-length'];
        this.#contentType = (req.headers['content-type']) ? req.headers['content-type'] : 'application/x-www-form-urlencoded';

        match = this.#contentType.match(/multipart\/form-data; boundary=(?<boundary>[\w\W]+)/);
        if (match) {
            this.#input.boundary = '--' + match.groups.boundary;
            this.#input.lastPart = Buffer.from({length:0});
        }
    }

    get totalLength() {
        return this.#totalLength;
    }

    getData(data, callback) {
        this.#input = multipartFormData(data, this.#input, callback);
    }
}

function multipartFormData(data, input, callback) {

    let chunk = Buffer.concat([input.lastPart, data]);
    let bytes = Buffer.from({length:0});
    let name = input.currentKey || '';
    let file = input.currentFile || '';
    let type = input.currentType || '';
    let header_read = input.readHeader || false;
    let content_read = input.readContent || false;
    let cursor = 0;
    let match;

    while (cursor < chunk.length) {
        if (chunk.subarray(cursor).includes(input.boundary)) {
            bytes = chunk.subarray(cursor, cursor + chunk.subarray(cursor).indexOf(input.boundary));
            cursor += chunk.subarray(cursor).indexOf(input.boundary) + input.boundary.length;
            content_read = false;
            if (type !== '') {
                callback(bytes, file, type);
            }
        }

        if (content_read) {
            bytes = chunk.subarray(cursor, chunk.length - input.boundary.length);
            input.lastPart = chunk.subarray(chunk.length - input.boundary.length);
            callback(bytes, file, type);
            break;
        }

        if (Buffer.from([chunk[cursor]]).toString() === '-') {
            break;
        }

        header_read = true;

        if (!chunk.subarray(cursor).includes('\r\n\r\n')) {
            input.lastPart = chunk.subarray(cursor);
            break;
        }

        match = chunk.subarray(cursor, cursor + chunk.subarray(cursor).indexOf('\r\n\r\n')).toString()
                    .match(/; name="(?<name>[^"]+)"/);
        if (match) { name = match.groups.name }

        match = chunk.subarray(cursor, cursor + chunk.subarray(cursor).indexOf('\r\n\r\n')).toString()
                    .match(/; filename="(?<file>[^"]+)"/);
        if (match) { file = match.groups.file }

        match = chunk.subarray(cursor, cursor + chunk.subarray(cursor).indexOf('\r\n\r\n')).toString()
                    .match(/Content-Type: (?<type>[\w\W]+)/);
        if (match) { type = match.groups.type }

        cursor += chunk.subarray(cursor).indexOf('\r\n\r\n') + ('\r\n\r\n').length;
        header_read = false;
        content_read = true;
    }

    input.currentKey = name;
    input.currentFile = file;
    input.currentType = type;
    input.readHeader = header_read;
    input.readContent = content_read;

    return input;
}

module.exports = {
    FormParser
}