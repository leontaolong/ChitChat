import React from 'react';
import {Link} from 'react-router-dom';
import {App} from './App';
import {ValidatedInput} from './SignIn';

class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'email': undefined,
      'password': undefined,
      'userName': undefined,
      'firstName': undefined,
      'lastName': undefined,
      'passwordConf': undefined,
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

  //handle signUp button
  signUp(event) {
    event.preventDefault(); //don't submit
    var thisComponent = this;
    this.setState({resErr: undefined, fetchErr: undefined});
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
    var request = new Request(apiURL + "users", { method: 'POST',
               headers: myHeaders,
               body: JSON.stringify(this.state),
               mode: 'cors',
               cache: 'default' });

    fetch(request)
    .then(function(response) {
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
        thisComponent.setState({fetchErr : "Fetch Error: " + err});
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

      //handle minLength
      if (validations.minLength && value.length < validations.minLength) {
        errors.minLength = validations.minLength;
        errors.isValid = false;
      }

      //handle email type ??
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

    //handle the password confirmation matching
    if (validations.toBeMatched && value !== validations.toBeMatched) {
      errors.matches = true;
      errors.isValid = false;
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
    var handleErrors = this.validate(this.state.userName, { required: true });
    var passwordConfirmationErrors = this.validate(this.state.password, { required: true, toBeMatched: this.state.passwordConf})
    var lastNameErrors = this.validate(this.state.lastName, { required: true });
    var firstNameErrors = this.validate(this.state.firstName, { required: true });
    //button validation
    var signUpEnabled = (emailErrors.isValid && passwordErrors.isValid && handleErrors.isValid && passwordConfirmationErrors.isValid && firstNameErrors.isValid && lastNameErrors.isValid);
    return (
        <div className="container">
          <div id="space">
          </div>
          {this.state.fetchErr !== undefined && <h4 style={{"color": "red"}}>{this.state.fetchErr}</h4>}
          {this.state.resErr !== undefined && <h4 style={{"color": "red"}}>{this.state.resErr}</h4>}
          <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="userName" type="text" label="Username" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="firstName" type="text" label="First Name" changeCallback={this.handleChange} errors={firstNameErrors} />

            <ValidatedInput field="lastName" type="text" label="Last Name" changeCallback={this.handleChange} errors={lastNameErrors} />

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConf" type="password" label="Confirm Password" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />

            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button> <br />
              <div className="signInUpLink"> Already have an account? <Link to="/signin">Sign In</Link> </div>
            </div>
          </form>
        </div>
      );
    }
}


export default SignUp;