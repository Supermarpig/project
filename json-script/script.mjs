import fs from 'fs';

// 從 all.json 檔案中載入JSON資料
let data = fs.readFileSync('all.json', 'utf-8');

// 將讀取到的字串轉換為JavaScript對象
data = JSON.parse(data);

// 計算資料筆數
let count = data.length;

console.log(count);