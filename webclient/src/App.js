import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { "data": '', "err": '' };
  }

  getData(url) {
    fetch(url) //download the data
      .then(function (res) {
        if (res.status !== 200) {
          this.setState("err", res.status);
        } else {
          this.setState("data", res.json());
        }
      })
      .catch(function (err) {
        this.setState("err", "Fetch error")
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
              <Search updateUrlCallbk={this.getData} />
              <Content contentData={this.state.data} />
            </div>
          </header>
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
    // event.preventDefault();
    console.log("searched: " + this.state.searchValue);
    this.props.updateUrl(this.state.searchValue);
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
            {/*<label className="mdl-textfield__label" >Expandable Input</label>*/}
          </div>
        </div>
      </div>
    );
  }
}

class Content extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return null;
  }
}
export default App;
