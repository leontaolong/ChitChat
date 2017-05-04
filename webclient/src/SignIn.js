import React from 'react';
import { Link } from 'react-router-dom';

class SignIn extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      'email': undefined,
      'password': undefined,
      'resErr': undefined,
      'fetchErr': undefined
    };
    //function binding
    this.handleChange = this.handleChange.bind(this);
  }
  //update state for specific field
  handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  //handle signIn button
  signIn(event) {
    event.preventDefault(); //don't submit
    var thisComponent = this;
    this.setState({ resErr: undefined, fetchErr: undefined });
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

    // delete resErr and fetchErr before handing this.state to the server as a json request
    delete this.state['resErr'];
    delete this.state['fetchErr'];
    var request = new Request(apiURL + "sessions", {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(this.state),
      mode: 'cors',
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
          var authToken = response.headers.get('authorization');
          localStorage.setItem('authToken', authToken);
          thisComponent.props.history.push('/profile');
        }
      })
      .catch(function (err) {
        thisComponent.setState({ fetchErr: "Fetch Error: " + err });
      });
  }

  /**
   * A helper function to validate a value based on a hash of validations
   * second parameter has format e.g., 
   * {required: true, minLength: 5, email: true}
   * (for required field, with min length of 5, and valid email)
   */
  validate(value, validations) {
    var errors = { isValid: true, style: '' };

    if (value !== undefined) { //check validations
      //handle required
      if (validations.required && value === '') {
        errors.required = true;
        errors.isValid = false;
      }

      //handle email type 
      if (validations.email) {
        //pattern comparison from w3c
        //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
        var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
        if (!valid) {
          errors.email = true;
          errors.isValid = false;
        }
      }
    }

    //display details
    if (!errors.isValid) { //if found errors
      errors.style = 'has-error';
    }
    else if (value !== undefined) { //valid and has input
      //errors.style = 'has-success' //show success coloring
    }
    else { //valid and no input
      errors.isValid = false; //make false anyway
    }
    return errors; //return data object
  }

  render() {
    //field validation
    var emailErrors = this.validate(this.state.email, { required: true, email: true });
    var passwordErrors = this.validate(this.state.password, { required: true, minLength: 6 });
    //button validation
    var signInEnabled = (emailErrors.isValid && passwordErrors.isValid);
    return (
      <div className="container">
        <div id="space">
        </div>
        {this.state.fetchErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.fetchErr}</h4>}
        {this.state.resErr !== undefined && <h4 style={{ "color": "red" }}>{this.state.resErr}</h4>}
        <form role="form" className="sign-up-form">
          <ValidatedInput field="email" type="email" label="Email Address" changeCallback={this.handleChange} errors={emailErrors} />
          <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />
          <div className="form-group sign-up-buttons">
            <button className="btn btn-primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button> <br />
            <div className="signInUpLink">Don't have an account? <Link to="/signup">Sign Up</Link></div>
          </div>
        </form>
      </div>
    );
  }
}

//A component that displays an input form with validation styling
//props are: field, type, label, changeCallback, errors
export class ValidatedInput extends React.Component {
  render() {
    return (
      <div className={"form-group " + this.props.errors.style}>
        <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
        <input aria-label="input" id={this.props.field} type={this.props.type} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
        <ValidationErrors errors={this.props.errors} />
      </div>
    );
  }
}
//a component to represent and display validation errors
export class ValidationErrors extends React.Component {
  render() {
    return (
      <div>
        {this.props.errors.required &&
          <p className="help-block">Required!</p>
        }
        {this.props.errors.email &&
          <p className="help-block">Not an email address!</p>
        }
        {this.props.errors.minLength &&
          <p className="help-block">Must be at least {this.props.errors.minLength} characters.</p>
        }
        {this.props.errors.matches &&
          <p className="help-block">Passwords doesn't match</p>
        }
      </div>
    );
  }
}

export default SignIn;

