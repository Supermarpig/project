// src/store/sagas/dataSaga.ts

import { call, put, takeEvery } from 'redux-saga/effects';
// import fetchAPI from '@/utils/fetchAPI'; // 假設您有一個 fetchAPI 函式可以用來發送 API 請求
import { setData, setError } from '../reducers/data'; // 假設您有對應的 action creators

function* fetchData() {
    try {
        const data = yield call(fetchAPI, 'https://tiny-server.zeabur.app/api/getData'); // 假設 API 請求的 URL 為 https://example.com/api/data
        yield put(setData(data)); // 發送 Redux action 來將數據存入 Redux store
    } catch (error) {
        yield put(setError(error.message)); // 發送 Redux action 來處理錯誤
    }
}

export function* watchFetchData() {
    yield takeEvery('FETCH_DATA', fetchData); // 監聽名為 FETCH_DATA 的 action，並觸發 fetchData
}
