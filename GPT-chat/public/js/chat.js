document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const usersElement = document.getElementById('users');
    const chatContainer = document.getElementById('chat-container');
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const apiKeyInput = document.getElementById('apikey');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');


    // 嘗試從本地存儲中獲取用戶名
    let username = localStorage.getItem('username');
    if (!username) {
        username = prompt('What is your name?') || `User_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem('username', username); // 將新用戶名儲存到本地存儲
    } else {
        // 如果本地存儲中已有用戶名，直接使用該用戶名
        console.log('Welcome back, ' + username);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        if (username && apiKey) {
            // 将用户名和 API 密钥发送到服务器
            socket.emit('register', { username, apiKey });

            // 隐藏登录表单并显示聊天容器
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'block';
        }
    });

    // 當表單提交時發送聊天消息
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            const message = input.value;
            socket.emit('chat message', { username, message });
            input.value = '';
        }
    });

    // 註冊用戶名
    socket.emit('register', username);

    // 監聽聊天消息
    socket.on('chat message', (data) => {
        // 当接收到新消息时，将其添加到消息列表中
        const item = document.createElement('li');
        item.textContent = `${data.username}: ${data.message}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    // 監聽用戶列表更新
    socket.on('user list', (userList) => {
        usersElement.innerHTML = ''; // 清空當前列表

        // 將當前用戶移至列表頂部
        userList = userList.filter(u => u !== username);
        userList.unshift(username);

        userList.forEach((user) => {
            const userElement = document.createElement('li');
            userElement.textContent = user;
            userElement.className = user === username ? 'current-user' : '';
            usersElement.appendChild(userElement);
        });
    });
});
    