const net = require('net');
const readline = require('readline');

let clientIdCounter = 0; // 用於創建新客戶端ID的計數器
const clients = new Map(); // 使用Map來存儲客戶端的ID和socket

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const server = net.createServer(socket => {
    const clientId = clientIdCounter++; // 給新客戶端分配一個唯一ID
    console.log(`Client connected with ID: ${clientId}`);
    clients.set(clientId, socket); // 將clientId和socket存儲在Map中

    socket.on('data', data => {
        console.log(`Client ${clientId} says:`, data.toString());
        // 現在可以使用clientId來識別發送消息的客戶端
        for (const [otherClientId, otherSocket] of clients.entries()) {
            if (otherClientId !== clientId) { // 不發送消息給源客戶端
                otherSocket.write(`Client ${clientId} says: ${data}`);
            }
        }
    });

    socket.on('end', () => {
        console.log(`Client ${clientId} disconnected.`);
        clients.delete(clientId); // 從Map中移除斷開連接的客戶端
    });
});

rl.on('line', (line) => {
    for (const [clientId, socket] of clients.entries()) {
        socket.write(`Server to Client ${clientId}: ${line}`);
    }
});

server.listen(80, () => {
    console.log('Server listening 啦');
});
