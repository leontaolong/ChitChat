import React from 'react';
import { ValidatedInput } from './SignIn';
import { Utils } from './Utils'

class Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'id': undefined,
      'email': undefined,
      'userName': undefined,
      'firstName': undefined,
      'lastName': undefined,
      'photoURL': undefined,
      'newFirstName': undefined,
      'newLastName': undefined,
      'resErr': undefined,
      'fetchErr': undefined,
      'updated': false
    };

    var thisComponent = this;
    //default base API URL to production
    var apiURL = "https://api.leontaolong.me/v1/";

    this.handleChange = this.handleChange.bind(this);
    // if our site is being served from localhost,
    // or the loop-back address, switch the base API URL
    // to localhost as well
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      apiURL = "https://localhost:2222/v1/"
    };

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
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  update() {
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

    var body = {
      'lastName': this.state.newLastName,
      'firstName': this.state.newFirstName
    }

    var request = new Request(apiURL + "users/me", {
      method: 'PATCH',
      headers: myHeaders,
      mode: 'cors',
      body: JSON.stringify(body),
      cache: 'default'
    });

    fetch(request)
      .then(function (response) {
        if (response.status >= 300) {
          return response.text().then((err) => {
            thisComponent.setState({ resErr: "Response Error: " + err });
            Promise.reject(err)
          });
        } else {
          return response.json();
        }
      })
      .then(function (j) {
        console.log(j);
          thisComponent.setState(j);
          thisComponent.setState({
            'resErr': undefined,
            'fetchErr': undefined,
            'updated': true
          });
      })
      .catch(function (err) {
        thisComponent.setState({ fetchErr: "Fetch Error: " + err });
      });
  }

  render() {
    //field validation
    var handleFirstName = Utils.validate(this.state.newFirstName, { required: true });
    var handleLastName = Utils.validate(this.state.newLastName, { required: true });
    //button validation
    var updateEnabled = (handleFirstName.isValid && handleLastName.isValid);

    return (
      <div className="userInfo">
        {this.state.updated && <h4 style={{ "color": "green" }}>Updated Successfully</h4>}
        {this.state.fetchErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.fetchErr}</h4>}
        {this.state.resErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.resErr}</h4>}
        <img src={this.state.photoURL} alt={this.props.userName} />
        <div className="username">username: {this.state.userName}</div>
        <div className="name">Name: {this.state.firstName} {this.state.lastName}</div>
        <h3>Edit Profile</h3>
        <ValidatedInput field="newFirstName" type="text" label="First Name" changeCallback={this.handleChange} errors={handleFirstName} />
        <ValidatedInput field="newLastName" type="text" label="Last Name" changeCallback={this.handleChange} errors={handleLastName} />
        <button className="btn btn-primary" disabled={!updateEnabled} onClick={(e) => this.update(e)}>Update</button>
      </div>
    );
  }
}

export default Edit;