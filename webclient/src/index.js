import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Profile from './Profile';
import './index.css';
import { IndexRoute, Router, Route, hashHistory } from 'react-router';

ReactDOM.render(
  <Router onUpdate={() => window.scrollTo(0, 0)} history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={SignIn} />
      <Route path="signin" component={SignIn} />
      <Route path="signup" component={SignUp} />
      <Route path="profile" component={Profile} />
    </Route>
  </Router>,
  document.getElementById('root')
);