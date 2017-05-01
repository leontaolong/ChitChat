import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: '', requestErr: '', fetchErr: '' };
    this.updateUrl = this.updateUrl.bind(this);
  }

  // update the user-put url and fectch the Open Graph props from the server
  updateUrl(url) {
      // clean up the current state
      this.setState({ data: '', requestErr: '', fetchErr: '' });
      var that = this;

      var ReqUrl = "https://api.leontaolong.me/v1/summary?url=" + url;
      fetch(ReqUrl) //download the data
        .then(function (res) {
          if (!res.ok) {
            that.setState({ requestErr: res.status + ": " + res.statusText });
            return;
          }
          return res.json();
        })
        .then(function (data) {
          if (typeof data === 'object')
            that.setState({ data: data });
        })
        .catch(function (err) {
          that.setState({ fetchErr: err.message });
        });
  }

  render() {
    return (
      <div className="App">
        <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
          <header className="mdl-layout__header">
            <div className="mdl-layout__header-row">
              <span className="mdl-layout-title">Open Graph Explorer</span>
              <div className="mdl-layout-spacer"></div>
              <Search updateUrlCallbk={this.updateUrl} />
            </div>
          </header>
          {this.state.requestErr !== '' && <h3 style={{ "color": "red" }}>Request Error: {this.state.requestErr}</h3>}
          {this.state.fetchErr !== '' && <h3 style={{ "color": "red" }}>Fetch Error: {this.state.fetchErr}</h3>}
          {this.state.data !== '' && <Content data={this.state.data} />}
        </div>
      </div>
    );
  }
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { searchValue: '' };
    this.handleSearchClicked = this.handleSearchClicked.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    var searchValue = event.target.value;
    if (searchValue !== undefined) {
      this.setState({ searchValue: searchValue });
    }
  }

  handleEnter(event) {
    if (event.keyCode === 13)
      this.handleSearchClicked();
  }

  handleSearchClicked(event) {
    if (this.state.searchValue !== '') 
      this.props.updateUrlCallbk(this.state.searchValue);
  }

  render() {
    return (
      <div>
        <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
          <label className="mdl-button mdl-js-button mdl-button--icon" type="submit" onClick={this.handleSearchClicked} htmlFor="sample6">
            <i className="material-icons">search</i>
          </label>
          <div className="mdl-textfield__expandable-holder">
            <input className="mdl-textfield__input" type="url" onChange={this.handleChange} onKeyDown={this.handleEnter} id="sample6" placeholder="search for website url" />
          </div>
        </div>
      </div>
    );
  }
}

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.updateState();
  }

  componentWillReceiveProps(prevProps, prevState) {
    this.updateState();
  }

  updateState() {
    // set default state first
    this.setState({
      title: "unknown",
      description: "unknown",
      // iamge placeholder
      image: "https://americanrv.com/sites/default/files/default_images/image-unavailable.jpg"
    });
    // overide state if necessary
    this.setState(this.props.data);
  }

  render() {
    var contentNode = [];
    // construct <Contentnode /> array with props and vals
    for (let i = 0; i < Object.keys(this.state).length; i++) {
      var prop = Object.keys(this.state)[i];
      var val = this.state[prop];
      contentNode.push(<ContentNode prop={prop} val={val} key={prop} />);
    }

    return (
      <div>{contentNode}</div>
    );
  }
}

class ContentNode extends Component {
  render() {  // render each Open Graph prop-val node
    return (
      <div>
        <h3>{this.props.prop}</h3>
        {this.props.prop === "image" && <img alt="open graph of the website" src={this.props.val} />}
        {this.props.prop !== "image" && <div>{this.props.val}</div>}
      </div>
    );
  }
}

export default App;
