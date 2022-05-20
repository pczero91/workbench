const { User } = require('../../../../tools/chat-server/chat-server');

const user = new User('usr2');

let options = {
    host: 'localhost',
    port: 3001
}

user.login(options);