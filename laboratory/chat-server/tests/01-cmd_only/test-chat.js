const { Server } = require('../../../../tools/chat-server/chat-server');
const { spawn } = require('child_process');

const chat = new Server(3001, 'localhost');
const directory = 'tests/01-cmd_only';

console.log('test-01-cmd_only');

spawn('start cmd /k \"node ' + directory + '/user1.js\" && start cmd /k \"node ' + directory + '/user2.js\"', { shell: true });