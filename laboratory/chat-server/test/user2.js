const { User } = require('../user/User');

const user = new User('Teresa');

let options = {
    host: 'localhost',
    port: 3001
}

user.login(options);