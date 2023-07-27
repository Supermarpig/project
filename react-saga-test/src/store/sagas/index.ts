import { all } from 'redux-saga/effects';
import { watchIncrementAsync, watchDecrementAsync } from './counterSaga'



export default function* rootSaga(){
  yield all([watchDecrementAsync(),watchIncrementAsync()]);
}