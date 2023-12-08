const net = require('net');
const readline = require('readline');

const SERVER_IP = '10.41.16.64';
const SERVER_PORT = 80;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
    console.log('Connected to server!');
});

client.on('data', data => {
    console.log( data.toString());
});

client.on('end', () => {
    console.log('Disconnected from server');
});

rl.on('line', (line) => {
    client.write(line);
});
