import React from 'react';
import { Link, withRouter } from 'react-router-dom'

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'id': undefined,
      'email': undefined,
      'userName': undefined,
      'firstName': undefined,
      'lastName': undefined,
      'photoURL': undefined,
      'resErr': undefined,
      'fetchErr': undefined,
      'chatbotRes': undefined
    };

    var thisComponent = this;
    //default base API URL to production
    var apiURL = "https://api.leontaolong.me/v1/";

    // if our site is being served from localhost,
    // or the loop-back address, switch the base API URL
    // to localhost as well
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      apiURL = "https://localhost:2222/v1/"
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleQuestion = this.handleQuestion.bind(this);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", localStorage.getItem('authToken'));
    var request = new Request(apiURL + "users/me", {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    });

    fetch(request)
      .then(function (response) {
        if (response.status >= 300) {
          return response.text().then((err) => {
            console.log("Response Error: " + err);
            thisComponent.setState({ resErr: "Response Error: " + err });
            Promise.reject(err)
          });
        } else {
          return response.json();
        }
      })
      .then(function (j) {
        thisComponent.setState(j);
      })
      .catch(function (err) {
        thisComponent.setState({ fetchErr: "Fetch Error: " + err });
      });
  }

    //update state for specific field
  handleChange(event) {
    this.setState({chatbotQuestion: event.target.value}); //update state
  }

  handleQuestion() {
    event.preventDefault(); //don't submit
        //this binding
    var thisComponent = this;
    //default base API URL to production
    var apiURL = "https://api.leontaolong.me/v1/";
    thisComponent.setState({ resErr: undefined, fetchErr: undefined, chatbotRes: undefined });

    // if our site is being served from localhost,
    // or the loop-back address, switch the base API URL
    // to localhost as well
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      apiURL = "https://localhost:2222/v1/"
    };
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Authorization", localStorage.getItem('authToken'));

    console.log(this.state.chatbotQuestion)

    var request = new Request(apiURL + "bot", {
      method: 'POST',
      headers: myHeaders,
      body: this.state.chatbotQuestion,
      mode: 'cors',
      cache: 'default'
    });

    fetch(request)
      .then(function (response) {
        if (response.status >= 300) {
          return response.text().then((err) => {
            console.log("Response Error: " + err);
            thisComponent.setState({ resErr: "Response Error: " + err });
            Promise.reject(err)
          });
        } else {
          return response.text();
        }
      })
      .then((data) => { console.log(data); thisComponent.setState({"chatbotRes" : data})})
      .catch(function (err) {
        thisComponent.setState({ fetchErr: "Fetch Error: " + err });
      });

  }



  signOut(push) {
    //this binding
    var thisComponent = this;
    //default base API URL to production
    var apiURL = "https://api.leontaolong.me/v1/";

    // if our site is being served from localhost,
    // or the loop-back address, switch the base API URL
    // to localhost as well
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      apiURL = "https://localhost:2222/v1/"
    };
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", localStorage.getItem('authToken'));

    var request = new Request(apiURL + "sessions/mine", {
      method: 'DELETE',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    });

    fetch(request)
      .then(function (response) {
        if (response.status >= 300) {
          return response.text().then((err) => {
            console.log("Response Error: " + err);
            thisComponent.setState({ resErr: "Response Error: " + err });
            Promise.reject(err)
          });
        } else {
          localStorage.removeItem('authToken');
          push()
        }
      })
      .catch(function (err) {
        thisComponent.setState({ fetchErr: "Fetch Error: " + err });
      });
  }

  render() {
    const SignOutButton = withRouter(({ history }) => (
      <button className="btn btn-primary signOutButton"
        onClick={() => { this.signOut(() => history.push('/')) }}>Sign Out</button>))

    return (
      <div className="userInfo">
        {this.state.fetchErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.fetchErr}</h4>}
        {this.state.resErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.resErr}</h4>}
        <img src={this.state.photoURL} alt={this.props.userName} />
        <div className="username">username: {this.state.userName}</div>
        <div className="name">name: {this.state.firstName}  {this.state.lastName}</div>
        <SignOutButton /> <br/>
        <Link to='/edit'><button className="btn btn-primary">Edit Profile</button></Link>
        <div className={"form-group "}>
        <label className="control-label">{"ask seeree a question"}</label>
        <input aria-label="input" className="form-control" onChange={this.handleChange} />
        {this.state.chatbotRes !== undefined && <div>{this.state.chatbotRes}</div>}
        <button className="btn btn-primary" onClick={this.handleQuestion}>Submit</button>
      </div>
      </div>
    );
  }
}

export default Profile;