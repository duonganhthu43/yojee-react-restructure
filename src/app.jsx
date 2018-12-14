import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import Home from './component/home/home'
import { Provider } from 'react-redux'
import NotificationComponent from './component/notifications/notification-list'
import store from './common/redux-util/create-store'

class App extends Component {
  render() {
    return (
      <main>
        <Provider store={store}>
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/notifications' component={NotificationComponent} />
          </Switch>
        </Provider>
      </main>
    );
  }
}

export default App;
