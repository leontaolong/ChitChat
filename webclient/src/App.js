import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    // this.state = { data: '', requestErr: '', fetchErr: '' };
    // this.updateUrl = this.updateUrl.bind(this);
  }

  // // update the user-put url and fectch the Open Graph props from the server
  // updateUrl(url) {
  //     // clean up the current state
  //     this.setState({ data: '', requestErr: '', fetchErr: '' });
  //     var that = this;

  //     var ReqUrl = "https://api.leontaolong.me/v1/summary?url=" + url;
  //     fetch(ReqUrl) //download the data
  //       .then(function (res) {
  //         if (!res.ok) {
  //           that.setState({ requestErr: res.status + ": " + res.statusText });
  //           return;
  //         }
  //         return res.json();
  //       })
  //       .then(function (data) {
  //         if (typeof data === 'object')
  //           that.setState({ data: data });
  //       })
  //       .catch(function (err) {
  //         that.setState({ fetchErr: err.message });
  //       });
  // }

  render() {
    return (
      <div className="App">
        <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
          <header className="mdl-layout__header">
            <div className="mdl-layout__header-row">
              <span className="mdl-layout-title">Open Graph Explorer</span>
              <div className="mdl-layout-spacer"></div>
              {/*<Search updateUrlCallbk={this.updateUrl} />*/}
            </div>
          </header>
          <div className="mdl-layout mdl-js-layout mdl-color--grey-100 main">
            <main className="mdl-layout__content">
              <div className="mdl-card mdl-shadow--6dp">
                <div className="mdl-card__title mdl-color--primary mdl-color-text--white">
                  <h2 className="mdl-card__title-text">Acme Co.</h2>
                </div>
                <div className="mdl-card__supporting-text">
                  <form action="#">
                    <div className="mdl-textfield mdl-js-textfield">
                      <input className="mdl-textfield__input" type="text" id="username" />
                      <label className="mdl-textfield__label" htmlFor="username">Username</label>
                    </div>
                    <div className="mdl-textfield mdl-js-textfield">
                      <input className="mdl-textfield__input" type="password" id="userpass" />
                      <label className="mdl-textfield__label" htmlFor="userpass">Password</label>
                    </div>
                  </form>
                </div>
                <div className="mdl-card__actions mdl-card--border">
                  <button className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">Log in</button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}



export default App;
