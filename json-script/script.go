package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

func main() {
	// 從 all.json 檔案中載入JSON資料
	data, err := ioutil.ReadFile("all.json")
	if err != nil {
		log.Fatal(err)
	}

	// 將讀取到的字串轉換為Go對象
	var jsonData []interface{}
	err = json.Unmarshal(data, &jsonData)
	if err != nil {
		log.Fatal(err)
	}

	// 計算資料筆數
	count := len(jsonData)

	fmt.Println(count)
}
