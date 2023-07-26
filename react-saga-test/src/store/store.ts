import { configureStore } from '@reduxjs/toolkit'

import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas'; // 在後面的步驟中會創建這個檔案
import rootReducer from './reducers'; // 在後面的步驟中會創建這個檔案

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware],
});
sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;