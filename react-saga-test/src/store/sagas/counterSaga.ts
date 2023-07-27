import { put, takeEvery } from 'redux-saga/effects'
import { increment, decrement } from '../reducers/index'

//put來觸發增加和減少計數器的動作
function* incrementAsync() {
  yield new Promise((resolve) => setTimeout(resolve, 1000));
  yield put(increment());
}
function* decrementAsync() {
  yield new Promise((resolve) => setTimeout(resolve, 1000));
  yield put(decrement());
}

//使用takeEvery來監聽異步動作觸發。
export function* watchIncrementAsync() {
  yield takeEvery('counter/incrementAsync', incrementAsync);
}

export function* watchDecrementAsync() {
  yield takeEvery('counter/decrementAsync', decrementAsync);
}