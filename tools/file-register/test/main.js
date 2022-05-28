var files = [];

const fileForm = document.getElementById('form-upload');
fileForm.addEventListener('submit', (event) => {
    event.preventDefault();
});

function getFilesSize(input) {
    let uploadedFiles = input.files;
    if (input.files.length == 0) {
        return;
    }
    files = [];
    for (let file of uploadedFiles) {
        files.push({
            filename: file.name,
            totalSize: file.size,
            progress: 0
        })
    }

    fileForm.addEventListener('submit', sendFiles);
    fileForm.addEventListener('submit', getUploadedDataLength);
}

function sendFiles(event) {
    const form = document.getElementById('form-upload');
    const data = new FormData(form);
    if (data) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', form.action);
        xhr.send(data);
    }
}

function getUploadedDataLength(event) {
    let xhr, index;
    let inProcess = true;
    setTimeout(() => {
        xhr = new XMLHttpRequest();
        xhr.addEventListener('loadend', (event) => {
            let response = JSON.parse(xhr.response);
            for (let k = 0; k < files.length; k++) {
                index = -1;
                for (let j = 0; j < response.length; j++) {
                    if (response[j].filename == files[k].filename) {
                        index = j;
                        break;
                    }
                }
                if (index == -1) { continue; }
                files[k].progress = Math.floor(response[index].bytesWritten/files[k].totalSize*100);
                if (files[k].progress > 100) {
                    files[k].progress = 100;
                }
            }
        });
        xhr.addEventListener('readystatechange', (event) => {
            if (xhr.readyState !== 4) {
                return;
            }
            showFilesInfo();
            inProcess = false;
            for (let k = 0; k < files.length; k++) {
                if (files[k].progress < 100) {
                    inProcess = true;
                    break;
                }
            }
            if (inProcess) {
                getUploadedDataLength();
                return;
            }
            window.location.href = fileForm.action;
            fileForm.removeEventListener('submit', sendFiles);
            fileForm.removeEventListener('submit', getUploadedDataLength);
        });
        xhr.open('get', 'http://pedro.rocalog.com/sizes');
        xhr.send();
    }, 1000);
}

function showFilesInfo() {
    let html = '';
    let display = document.getElementById('progress');
    for (let file of files) {
        html += '<p>' + file.filename + ': ' + file.progress + ' %</p>\n';
    }
    display.innerHTML = html;
}