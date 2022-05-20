const { User } = require('../user/User');

const user = new User('Pedro');

let options = {
    host: 'localhost',
    port: 3001
}

user.login(options);