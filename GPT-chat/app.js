const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// 初始化 Express 應用
const app = express();
// 創建一個服務器
const server = http.createServer(app);
// 將 socket.io 綁定到服務器
const io = socketIO(server);

// 設置一個靜態文件夾用於存放前端檔案
app.use(express.static('public'));

// 儲存用戶名和socket.id的對應關係
const users = {};

// 更新用戶列表和在線人數的功能
function updateUsers() {
    io.emit('user list', Object.values(users)); // 廣播用戶列表給所有用戶
    io.emit('user count', Object.keys(users).length); // 廣播在線人數
}

// 處理 WebSocket 連接
io.on('connection', (socket) => {
    socket.on('register', (username) => {
        users[socket.id] = username;
        updateUsers(); // 更新用戶列表和在線人數
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        updateUsers(); // 更新用戶列表和在線人數
    });
});

// 聽取 3000 端口
server.listen(3000, () => {
    console.log('listening on *:3000');
});
