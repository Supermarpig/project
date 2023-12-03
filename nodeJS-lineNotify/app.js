const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const querystring = require('querystring');

// 定義獲取檔案內容的函數
function getFile(filePath, res, contentType) {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('Sorry, file not found');
            } else {
                res.writeHead(500);
                res.end('Sorry, there was an error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

function sendLineNotification(token, message, callback) {
    // 正確地格式化消息數據
    const data = new URLSearchParams({ message: message }).toString();

    const options = {
        hostname: 'notify-api.line.me',
        path: '/api/notify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        }
    };

    const req = https.request(options, res => {
        let responseData = '';

        res.on('data', d => {
            responseData += d;
        });

        res.on('end', () => {
            callback(null, responseData);
        });
    });

    req.on('error', error => {
        callback(error, null);
    });

    // 將格式化後的數據寫入請求體
    req.write(data);
    req.end();
}



// 創建 HTTP 伺服器
http.createServer(function (req, res) {
    if (req.method === 'GET') {
        let fileUrl = 'index.html';

        if (req.url !== '/') {
            fileUrl = req.url;
        }

        const filePath = path.join(__dirname, 'public', fileUrl);
        const fileExt = path.extname(filePath);
        let contentType = 'text/html';

        switch (fileExt) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            // 可以根據需要增加更多的檔案類型
        }

        getFile(filePath, res, contentType);
    } else if (req.method === 'POST' && req.url === '/sendnotify') {
        // 處理發送到 LINE Notify 的 POST 請求
        let body = '';

        req.on('data', function (chunk) {
            body += chunk.toString();
        });

        req.on('end', function () {
            const postData = querystring.parse(body);
            sendLineNotification(postData.token, postData.message, function (err, response) {
                if (err) {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success', detail: 'Message sent' }));
                }
            });
        });
    }
}).listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000/');
});
