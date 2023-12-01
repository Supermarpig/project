import json 

# 從檔案中載入JSON資料
with open('all.json', 'r') as file:
    data = json.load(file)

# 計算資料筆數
count = len(data)

print(count)
