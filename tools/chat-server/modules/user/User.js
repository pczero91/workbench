const { Socket } = require('net');
const { stdin } = require('process');

class User extends Socket {
    #userName;
    #chatContent = [];
    #inputStream
    constructor(userName, inputStream = stdin) {
        super();
        this.#userName = userName;
        this.#inputStream = inputStream;
        this.once('data', () => {
            this.on('data', (data) => {
                const reg = new RegExp(this.#userName + ': exit[\r\n]+');
                let match = data.toString().match(reg);
                if (match) {
                    this.removeAllListeners('data');
                    this.end(this.#userName + ' has disconected\n');
                    console.log('You have disconected');
                } else {
                    match = data.toString().match(/[\W\w\r\n\s]*: exit[\r\n]+/);
                    if (!match) {
                        this.chat(data.toString());
                    }
                }
            });
        });
        this.on('close', (hadError) => {
            if (hadError) {console.log('Close error')}
            this.destroy();
            this.#inputStream.destroy();
        });
        this.on('error', (err) => {
            console.log(err.message);
        });
    }

    get name() {
        return this.#userName;
    }

    chat(data) {
        let chat = "";
        console.clear();
        this.#chatContent.push(data);
        this.#chatContent.forEach((c) => {
            chat += c;
        });
        console.log(chat);
    }

    login(options) {
        this.connect(options, () => {
            console.clear();
            console.log('Connected to chat!');
            this.write(this.#userName + ' has connected\n');
        });

        this.#inputStream.on('data', (data) => {
            this.write(this.#userName + ': ' + data.toString());
            console.clear();
        });
    }
}

module.exports = {
    User
}