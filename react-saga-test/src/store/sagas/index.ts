import { call, put, all, StrictEffect,takeLatest } from 'redux-saga/effects';
// import fetchAPI from '@utils/fetchAPI';

// TODO: 在這裡導入並整合 sagas


function* setMiniRuleInfoAsync(action: any): Generator<StrictEffect, any, any> {
  const Miniruleinfo = yield call(fetchAPI, {
      // url: `${confirmationRoute}/miniruleinfo`,
      url: 'https://tiny-server.zeabur.app/api/getdata',
      req: action.payload,
  });
  // console.log('Miniruleinfo',Miniruleinfo);
  yield put(actions.setMiniRuleInfoSuccess(Miniruleinfo));
}

function* watchMiniRuleInfoAsync() {
  console.log('watchMiniRuleInfoAsync');
  yield takeLatest(actionTypes.SET_MINIRULEINFO, setMiniRuleInfoAsync);
}

export default function* rootSaga() {
  yield all([
    // TODO: 在這裡添加 sagas
    watchMiniRuleInfoAsync(),
  ]);
}
