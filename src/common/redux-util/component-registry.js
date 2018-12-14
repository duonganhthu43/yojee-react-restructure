export class ComponentRegistry {
  constructor() {
    this._emitChange = null;
    this._reducers = {};
    this._sagas = {};
    console.log('==== ComponentRegistry init')
  }

  getReducers() {
    console.log('==== getReducers ', this._reducers)
    return { ...this._reducers };
  }

  getSagas() {
    console.log('=========== getSaga ', this._sagas)

    return { ...this._sagas };
  }

  registerSaga(name, saga) {
    this._sagas = { ...this._sagas, [name]: saga };
    console.log('=========== registerSaga ', this._sagas)
    if (this._emitChange) {
      this._emitChange(this.getSagas());
    }
  }
  registerReducer(name, reducer) {
    console.log('=========== register reducer ', name)
    this._reducers = { ...this._reducers, [name]: reducer };

    if (this._emitChange) {
      this._emitChange(this.getReducers());
    }
  }

  register(name, reducer, saga) {
    console.log('=========== register ', name)

    this._reducers = { ...this._reducers, [name]: reducer };
    this._sagas = { ...this._sagas, [name]: saga };

    if (this._emitChange) {
      this._emitChange(this.getReducers());
      this._emitChange(this.getSagas());

    }
  }

  setChangeListener(listener) {
    this._emitChange = listener;
  }
}

const componentRegistry = new ComponentRegistry();
export default componentRegistry;