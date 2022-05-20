const { User } = require('../modules/user/User');

const user = new User('usr2');

let options = {
    host: 'localhost',
    port: 3001
}

user.login(options);