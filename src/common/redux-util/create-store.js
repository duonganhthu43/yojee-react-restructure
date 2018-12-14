
import { combineReducers, createStore, applyMiddleware } from 'redux';
import componentRegistry from './component-registry';
import createSagaMiddleware from 'redux-saga'

const initialState = {}
const combine = (reducers) => {
  const reducerNames = Object.keys(reducers);
  Object.keys(initialState).forEach(item => {
    if (reducerNames.indexOf(item) === -1) {
      reducers[item] = (state = null) => state;
    }
  });
  console.log('============== create store: === combine reducer ')
  return combineReducers(reducers);
}
const combineSaga = (intput) => {
  const sagaNames = Object.keys(intput);
  console.log('==== sagaName ', sagaNames)
  if (sagaNames && sagaNames.length > 0) {
    sagaNames.forEach((value) => {
      multipleSaga(intput[value])
    })
  }
}
const multipleSaga = (input) => {
  console.log('===== multipleSaga', input)
  sagaMiddleware.run(input)
  // if (input && input.length) {
  //   input.forEach((value, index) => {
  //     sagaMiddleware.run(value)
  //   })
  // }
}

const sagaMiddleware = createSagaMiddleware()
const reducer = combine(componentRegistry.getReducers());
// const store = createStore(reducer, initialState);
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
combineSaga(componentRegistry.getSagas())
// sagaMiddleware.run()
// Replace the store's reducer whenever a new reducer is registered.
componentRegistry.setChangeListener(reducers => {
  console.log('=========== ChangeListener', reducers)
  console.log('=========== reducer is changed', reducers)
  store.replaceReducer(combine(reducers));
});

export default store;