import React from 'react';
import {Link} from 'react-router-dom'

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
    this.state = {
      'email': undefined,
      'userName': undefined,
      'firstName': undefined,
      'lastName': undefined,
      'photoURL': undefined,
      '-': undefined,
      'resErr': undefined,
      'fetchErr': undefined
    };
    //function binding
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

    var request = new Request(apiURL + "users/me", { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' });

    fetch(request)
    .then(function(response) {
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
    .then(function(j) {  
      thisComponent.setState(j);
      console.log(j);
    })
    .catch(function (err) {
      thisComponent.setState({fetchErr : "Fetch Error: " + err});
    });
  }

  signOut(e) {
    localStorage.removeItem('authToken');
  }

  render() {
    return (
      <div className="userInfo">
        {this.state.fetchErr !== undefined && <h4 style={{"color": "red"}}>{this.state.fetchErr}</h4>}
        {this.state.resErr !== undefined && <h4 style={{"color": "red"}}>{this.state.resErr}</h4>}
        <img src={this.state.photoURL} alt={this.props.userName} />
        <div id="username">username: {this.state.userName}</div>
        <div id="name">name: {this.state.firstName}  {this.state.lastName}</div>
        <Link to='/signin'><button className="btn btn-primary signOutButton" onClick={(e) => this.signOut(e)}>Sign Out</button></Link>
      </div>
    );
  }
}

export default Profile;