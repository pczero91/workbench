class FormParser {

    #contentType;
    #boundary;
    #currentFile;
    #currentKey;
    #currentType;
    #lastPart = false;
    #internalBuffer;

    constructor(req) {
        this.#contentType = (req.headers['content-type']) ? req.headers['content-type'].split(";")[0] : 'application/x-www-form-urlencoded';
    }

    get haveBoundary() {
        return this.#boundary !== undefined;
    }

    static getBoundary(chunk) {
        if (chunk.includes('\r\n')) {
            let limit = chunk.indexOf('\r\n');
            return chunk.subarray(0, limit);
        }
    }

    getBoundary(chunk) {
        this.#boundary = FormParser.getBoundary(chunk);
    }

    getData(data, callback) {
        // if (this.#contentType == 'multipart/form-data') {
        //     let input = {
        //         lastPart: this.#lastPart,
        //         currentFile: this.#currentFile,
        //         boundary: this.#boundary,
        //         currentKey: this.#currentKey,
        //         currentType: this.#contentType 
        //     }
        //     input = dataFromMultipartFormData(data, input, callback);
    
        //     this.#lastPart = input.lastPart;
        //     this.#currentFile = input.currentFile;
        //     this.#boundary = input.boundary;
        //     this.#currentKey = input.currentKey;
        //     this.#currentType = input.currentType;
        // }
    }
}

function getValueFromData (chunk, output, offset = 0, text = '', endpoint = '') {
    let endPos = 0;
    endPos = chunk.subarray(offset + chunk.subarray(offset).indexOf(text)).indexOf(endpoint);
    output = chunk.subarray(offset + text.length + chunk.subarray(offset).indexOf(text), offset + chunk.subarray(offset).indexOf(text) + endPos).toString();
    offset += text.length + chunk.subarray(offset).indexOf(text) + endpoint.length + output.length;
    return [
        offset,
        output
    ];
}

function readBoundary(chunk, boundaryBuffer, offset, lastPart) {
    if (!boundaryBuffer) {
        boundaryBuffer = FormParser.getBoundary(chunk)
    }
    let data;
    let text = boundaryBuffer.toString();

    if (lastPart) {
        data = Buffer.concat(lastPart, chunk);
    } else {
        data = chunk;
        lastPart = Buffer.from({ length: 0 });
    }

    if (data.subarray(offset).includes(text)) {
        offset += text.length + data.subarray(offset).indexOf(text);
    } 
    
    if (offset >= lastPart.length) {
        offset += lastPart.length;
    } else {
        lastPart = lastPart.subarray(offset);
        offset = 0;
    }

    if (chunk.subarray(offset).length < boundaryBuffer.length) {
        lastPart = chunk.subarray(offset);
        offset = chunk.length;
    }

    return [
        offset,
        boundaryBuffer, 
        lastPart
    ];
}

function readHeader (chunk, offset, key, file, type, lastPart) {
    let text = 'Content-Disposition: form-data;';
    let wholeHeader = false;
    let data;

    if (lastPart) {
        data = Buffer.concat(lastPart, chunk);
    } else {
        data = chunk;
        lastPart = Buffer.from({ length: 0 });
    }

    if (data.subarray(offset).includes(text)) {
        offset += text.length + data.subarray(offset).indexOf(text);
        text = 'name="';
        if (data.subarray(offset).includes(text)) {
            [offset, key] = getValueFromData(data, key, offset, text, '";');
        }
        text = 'filename="';
        if (data.subarray(offset).includes(text)) {
            [offset, file] = getValueFromData(data, file, offset, text, '"\r\n');
        }
        text = 'Content-Type: ';
        if (data.subarray(offset).includes(text)) {
            [offset, type] = getValueFromData(data, type, offset, text, '\r\n');
        }
        text = '\r\n';
        if (data.subarray(offset).includes(text)) {
            [offset, ] = getValueFromData(data, file, offset, text, '');
            console.log(file);
            console.log('---------------');
            wholeHeader = true;
        }
    } else {
        wholeHeader = true;
    }
    
    if (offset >= lastPart.length) {
        offset += lastPart.length;
    } else {
        lastPart = lastPart.subarray(offset);
        offset = 0;
    }

    if (!wholeHeader) {
        lastPart = chunk.subarray(offset);
        offset = chunk.length;
    }

    return [
        offset,
        key,
        file,
        type,
        lastPart
    ];
}

function readContent(chunk, offset, file, type, lastPart, callback) {
    let endIndex = chunk.length;
    let data;

    if (lastPart) {
        data = Buffer.concat(lastPart, chunk);
    } else {
        data = chunk;
        lastPart = Buffer.from({ length: 0 });
    }

    // Se puede hacer este proceso desde aquí?
    if (data.subarray(offset).includes('-')) {
        endIndex = data.subarray(offset).indexOf('-') + offset;
    }

    callback(data.subarray(offset, endIndex), file, type);

    if (offset >= lastPart.length) {
        offset += lastPart.length;
    } else {
        lastPart = lastPart.subarray(offset);
        offset = 0;
    }

    return endIndex;
}

// function dataFromMultipartFormData(data, input, callback) {
//     if (typeof input == 'function') {
//         callback = input;
//         input = {
//             lastPart: false,
//             currentFile: undefined,
//             boundary: undefined,
//             currentKey: undefined,
//             currentType: undefined
//         }
//     }

//     let {
//         lastPart,
//         currentFile,
//         boundary,
//         currentKey,
//         currentType
//     } = input;
    
//     // Get boundary bytes;
//     if (!boundary) {
//         boundary = FormParser.getBoundary(data);
//         if(!boundary) {
//             return;
//         }
//     }

//     // Get number of files in current chunk of data
//     let chunk = data;
//     if (lastPart) {
//         chunk = Buffer.concat([lastPart, data]);
//     }
//     lastPart = false;
//     let k = 0;
//     let filesNumber = (currentFile) ? 1 : 0;
//     while (chunk.subarray(k).includes(boundary)) {
//         filesNumber++;
//         k += boundary.length + chunk.subarray(k).indexOf(boundary);
//         if (chunk.subarray(k).indexOf('--\r\n') == 0) {
//             filesNumber--;
//         }
//     }

//     // Start parsing
//     let j = 0;
//     k = 0;
//     // Check if there is chunk with data from the previous written record
//     if(chunk.subarray(k).includes(boundary)) {
//         if (chunk.subarray(k).indexOf(boundary) > 0) {
//             k += chunk.subarray(k).indexOf(boundary);
//             callback(chunk.subarray(0, k), currentFile, currentType);
//         }
//         k += boundary.length + chunk.subarray(k).indexOf(boundary);
//     }

//     // Get header and write the content of the files received except the last one;
//     while (j < filesNumber - 1) {
//         [k, currentKey, currentFile, currentType, lastPart] = readHeader(chunk, k, currentKey, currentFile, currentType);
//         if (chunk.subarray(k).includes(boundary)) {
//             callback(chunk.subarray(k, k + chunk.subarray(k).indexOf(boundary)), currentFile, currentType);
//             k += boundary.length + chunk.subarray(k).indexOf(boundary);
//         }
//         j++;
//     }

//     // Get the last file header
//     [k, currentKey, currentFile, currentType, lastPart] = readHeader(chunk, k, currentKey, currentFile, currentType);
//     if (lastPart.length > 0) {
//         return;
//     }
//     // Check if the current chunk of data is the last one and write the rest of the content in the last file received
//     if (chunk.subarray(k).includes(boundary + '--')) {
//         callback(chunk.subarray(k, k + chunk.subarray(k).indexOf(boundary + '--')), currentFile, currentType);
//     } else {
//         // Look if there is the possibility of finding a new boundary mark. Save the rest of the chunk
//         // for joining it to the next chunk of data if true, and check again when the next chunk arrives.
//         // If false, copy the rest of the chunk and wait for the next one.
//         if (chunk.subarray(k).includes('-')) {
//             if (chunk.subarray().length < boundary.length) {
//                 callback(chunk.subarray(k, k + chunk.subarray(k).indexOf('-')), currentFile, currentType);
//                 k += chunk.subarray(k).indexOf('-');
//                 lastPart = chunk.subarray(k);
//             } else {
//                 lastPart = false;
//                 callback(chunk.subarray(k), currentFile, currentType);
//             }
//         } else {
//             lastPart = false;
//             callback(chunk.subarray(k), currentFile, currentType);
//         }
//     }

//     return {
//         lastPart: lastPart,
//         currentFile: currentFile,
//         boundary: boundary,
//         currentKey: currentKey,
//         currentType: currentType
//     };
// }

function dataMultipartFormData(chunk, input, callback) {
    let [
        boundaryBuffer,
        key,
        file,
        type,
        lastPart
    ] = input;
    let offset = 0;
    
    while (offset < chunk.length) {
        [offset, boundaryBuffer, lastPart] = readBoundary(chunk, boundaryBuffer, offset, lastPart);
        [offset, key, file, type, lastPart] = readHeader(chunk, offset, key, file, type, lastPart);
        offset = readContent(chunk, offset, file, type, lastPart, callback);
    }
}

module.exports = {
    FormParser
}

// class FormParser {

//     #contentType;
//     #boundary;
//     #currentFile;
//     #currentKey;
//     #currentType;
//     #lastPart = false;

//     constructor(req) {
//         this.#contentType = (req.headers['content-type']) ? req.headers['content-type'].split(";")[0] : 'application/x-www-form-urlencoded';
//     }

//     get haveBoundary() {
//         return this.#boundary !== undefined;
//     }

//     static getBoundary(chunk) {
//         if (chunk.includes('\r\n')) {
//             let limit = chunk.indexOf('\r\n');
//             return chunk.subarray(0, limit);
//         }
//     }

//     getBoundary(chunk) {
//         this.#boundary = FormParser.getBoundary(chunk);
//     }

//     getData(data, callback) {
//         if (this.#contentType == 'multipart/form-data') {
//             let input = {
//                 lastPart: this.#lastPart,
//                 currentFile: this.#currentFile,
//                 boundary: this.#boundary,
//                 currentKey: this.#currentKey,
//                 currentType: this.#contentType 
//             }
//             input = dataFromMultipartFormData(data, input, callback);
    
//             this.#lastPart = input.lastPart;
//             this.#currentFile = input.currentFile;
//             this.#boundary = input.boundary;
//             this.#currentKey = input.currentKey;
//             this.#currentType = input.currentType;
//         }
//     }
// }

// function getValueFromData (chunk, output, offset = 0, text = '', endpoint = '') {
//     let endPos = 0;
//     endPos = chunk.subarray(offset + chunk.subarray(offset).indexOf(text)).indexOf(endpoint);
//     output = chunk.subarray(offset + text.length + chunk.subarray(offset).indexOf(text), offset + chunk.subarray(offset).indexOf(text) + endPos).toString();
//     offset += text.length + chunk.subarray(offset).indexOf(text) + endpoint.length + output.length;
//     return [
//         offset,
//         output
//     ];
// }

// function readHeader (chunk, offset, key, file, type) {
//     let text = 'Content-Disposition: form-data;';
//     let wholeHeader = false;
//     let lastPart = false;
//     if (chunk.subarray(offset).includes(text)) {
//         offset += text.length + chunk.subarray(offset).indexOf(text);
//         text = 'name="';
//         if (chunk.subarray(offset).includes(text)) {
//             [offset, key] = getValueFromData(chunk, key, offset, text, '";');
//         }
//         text = 'filename="';
//         if (chunk.subarray(offset).includes(text)) {
//             [offset, file] = getValueFromData(chunk, file, offset, text, '"\r\n');
//         }
//         text = 'Content-Type: ';
//         if (chunk.subarray(offset).includes(text)) {
//             [offset, type] = getValueFromData(chunk, type, offset, text, '\r\n');
//         }
//         text = '\r\n';
//         if (chunk.subarray(offset).includes(text)) {
//             [offset, ] = getValueFromData(chunk, file, offset, text, '');
//             console.log(file);
//             console.log('---------------');
//             wholeHeader = true;
//         }
//     } else {
//         wholeHeader = true;
//     }
//     if (!wholeHeader) {
//         lastPart = chunk.subarray(offset);
//         offset = chunk.length;
//     }

//     return [
//         offset,
//         key,
//         file,
//         type,
//         lastPart
//     ];
// }

// function dataFromMultipartFormData(data, input, callback) {
//     if (typeof input == 'function') {
//         callback = input;
//         input = {
//             lastPart: false,
//             currentFile: undefined,
//             boundary: undefined,
//             currentKey: undefined,
//             currentType: undefined
//         }
//     }

//     let {
//         lastPart,
//         currentFile,
//         boundary,
//         currentKey,
//         currentType
//     } = input;
    
//     // Get boundary bytes;
//     if (!boundary) {
//         boundary = FormParser.getBoundary(data);
//         if(!boundary) {
//             return;
//         }
//     }

//     // Get number of files in current chunk of data
//     let chunk = data;
//     if (lastPart) {
//         chunk = Buffer.concat([lastPart, data]);
//     }
//     lastPart = false;
//     let k = 0;
//     let filesNumber = (currentFile) ? 1 : 0;
//     while (chunk.subarray(k).includes(boundary)) {
//         filesNumber++;
//         k += boundary.length + chunk.subarray(k).indexOf(boundary);
//         if (chunk.subarray(k).indexOf('--\r\n') == 0) {
//             filesNumber--;
//         }
//     }

//     // Start parsing
//     let j = 0;
//     k = 0;
//     // Check if there is chunk with data from the previous written record
//     if(chunk.subarray(k).includes(boundary)) {
//         if (chunk.subarray(k).indexOf(boundary) > 0) {
//             k += chunk.subarray(k).indexOf(boundary);
//             callback(chunk.subarray(0, k), currentFile, currentType);
//         }
//         k += boundary.length + chunk.subarray(k).indexOf(boundary);
//     }

//     // Get header and write the content of the files received except the last one;
//     while (j < filesNumber - 1) {
//         [k, currentKey, currentFile, currentType, lastPart] = readHeader(chunk, k, currentKey, currentFile, currentType);
//         if (chunk.subarray(k).includes(boundary)) {
//             callback(chunk.subarray(k, k + chunk.subarray(k).indexOf(boundary)), currentFile, currentType);
//             k += boundary.length + chunk.subarray(k).indexOf(boundary);
//         }
//         j++;
//     }

//     // Get the last file header
//     [k, currentKey, currentFile, currentType, lastPart] = readHeader(chunk, k, currentKey, currentFile, currentType);
//     if (lastPart.length > 0) {
//         return;
//     }
//     // Check if the current chunk of data is the last one and write the rest of the content in the last file received
//     if (chunk.subarray(k).includes(boundary + '--')) {
//         callback(chunk.subarray(k, k + chunk.subarray(k).indexOf(boundary + '--')), currentFile, currentType);
//     } else {
//         // Look if there is the possibility of finding a new boundary mark. Save the rest of the chunk
//         // for joining it to the next chunk of data if true, and check again when the next chunk arrives.
//         // If false, copy the rest of the chunk and wait for the next one.
//         if (chunk.subarray(k).includes('-')) {
//             if (chunk.subarray().length < boundary.length) {
//                 callback(chunk.subarray(k, k + chunk.subarray(k).indexOf('-')), currentFile, currentType);
//                 k += chunk.subarray(k).indexOf('-');
//                 lastPart = chunk.subarray(k);
//             } else {
//                 lastPart = false;
//                 callback(chunk.subarray(k), currentFile, currentType);
//             }
//         } else {
//             lastPart = false;
//             callback(chunk.subarray(k), currentFile, currentType);
//         }
//     }

//     return {
//         lastPart: lastPart,
//         currentFile: currentFile,
//         boundary: boundary,
//         currentKey: currentKey,
//         currentType: currentType
//     };
// }

// module.exports = {
//     FormParser
// }