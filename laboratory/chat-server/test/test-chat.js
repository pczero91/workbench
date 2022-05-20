const { Chat } = require('../chat/Chat');
const { spawn } = require('child_process');

const chat = new Chat(3001, 'localhost');

spawn('start cmd /k \"node test/user1.js\" && start cmd /k \"node test/user2.js\"', { shell: true });