import { all } from 'redux-saga/effects';
import { watchIncrementAsync, watchDecrementAsync } from './counterSaga'
import { watchFetchData } from './dataSagas'; // 假設您的 dataSaga 檔案位於這個位置



export default function* rootSaga(){
  yield all([
    watchDecrementAsync(),
    watchIncrementAsync(),
    watchFetchData(),
  ]);
}