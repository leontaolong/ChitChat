import React, { Component } from 'react';
import './App.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Profile from './Profile';
import Edit from './Edit';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  authenticated() {    
    return (localStorage.getItem('authToken') !== null);
  }

  render() {
    return (
      <div className="App">
        <Header />
      <Router>
          <div>
            <Route exact path="/" component={SignIn} />
            <Route path="/signin" component={SignIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="/profile" render={() => this.authenticated() ? <Profile/> : <Redirect to="/" />} />
            <Route path="/edit" render={() => this.authenticated() ? <Edit/> : <Redirect to="/" />} />
          </div>
      </Router>
      </div>
    );
  }
}

class Header extends Component {
  render() {
    return (
        <div className="mdl-layout--fixed-header">
          <header className="mdl-layout__header">
            <div className="mdl-layout__header-row">
              <span className="mdl-layout-title">INFO 344</span>
            </div>
          </header>
         </div>
    );
  }
}
export default App;
