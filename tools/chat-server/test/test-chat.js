const { Server } = require('../modules/server/Server');
const { spawn } = require('child_process');

const chat = new Server(3001, 'localhost');

spawn('start cmd /k \"node test/user1.js\" && start cmd /k \"node test/user2.js\"', { shell: true });