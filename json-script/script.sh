#!/bin/bash

# 這個腳本需要jq工具
# 從 all.json 檔案中載入JSON資料並計算資料筆數
count=$(jq length all.json)

echo $count