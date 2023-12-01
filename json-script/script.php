<?php

// 從 all.json 檔案中載入JSON資料
$data = file_get_contents('all.json');

// 將讀取到的字串轉換為PHP對象
$data = json_decode($data);

// 計算資料筆數
$count = count($data);

echo $count;

?>