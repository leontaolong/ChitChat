import React from 'react';
import {Link} from 'react-router-dom';
import {ValidatedInput} from './SignIn';

/**
 * A form for signing up and logging into a website.
 * Specifies email, password, user handle, and avatar picture url.
 * Expects `signUpCallback` and `signInCallback` props
 */
class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'email': undefined,
      'password': undefined,
      'userName': undefined,
      'firstName': undefined,
      'lastName': undefined,
      'passwordConf': undefined
    };

    //function binding
    this.handleChange = this.handleChange.bind(this);
    this.signUpUser = this.signUpUser.bind(this);
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
    //default base API URL to production
    //replace `your-domain.com` with your domain name
    var apiURL = "https://api.leontaolong.me/v1/";

    //if our site is being served from localhost,
    //or the loop-back address, switch the base API URL
    //to localhost as well
    // if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    //     apiURL = "https://localhost:4000/v1/"
    // };

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var request = new Request(apiURL + "users", { method: 'POST',
               headers: myHeaders,
               body: JSON.stringify(this.state),
               mode: 'cors',
               cache: 'default' });

    fetch(request)
    .then(function(response) {
      return response.json();
    })
    .then(function(j) {
      console.log(j);
    });
  }

  //A callback function for registering new users
  signUpUser(email, password, handle, firstName, lastName) {
    /* Create a new user and save their information */
    var thisComponent = this;
    thisComponent.setState({ visible: !thisComponent.state.visible });
    
    // firebase.auth().createUserWithEmailAndPassword(email, password)
    //   .then((firebaseUser) => {
    //     firebaseUser.sendEmailVerification();
    //     thisComponent.setState({ visible: !thisComponent.state.visible });
    //     var userData = {
    //       displayName: handle
    //     }

    //     var profilePromise = firebaseUser.updateProfile(userData);

    //     //add to the JITC 
    //     //jsonObjectInTheCloud['users'].push(userData)
    //     var newUserRef = firebase.database().ref('users/' + firebaseUser.uid);
    //     newUserRef.set(userData);
    //     return profilePromise;
    //   })
    //   .catch((error) => {
    //     thisComponent.setState({ error: error.message, visible: !thisComponent.state.visible });
    //   })
    //   .then(function () { if (firebase.auth().currentUser) hashHistory.push('/home') });
  }

  //handle signIn button
  signIn(event) {
    event.preventDefault(); //don't submit
    this.props.signInCallback(this.state.email, this.state.password);
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
    // var signInEnabled = (emailErrors.isValid && passwordErrors.isValid && passwordConfirmationErrors.isValid);
    /*if (this.state.visible) {
      return (
        <div className="container">
          <div id="space">
          </div>
          <div className="message">
            <i className="fa fa-cog fa-spin fa-4x fa-fw"></i>
            <span className="sr-only">Loading...</span>
          </div>
          <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="name" type="text" label="Your Name" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConfirm" type="password" label="Password Confirm" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />

            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button> <br />
              <div>Already have an account? <Link to="/signin">Sign In</Link></div>
            </div>
          </form>
        </div>
      );
    }

    //if there are error display then in the error field
    if (this.state.error) {
      return (
        <div className="container">
          <div id="space">
          </div>
          <div bsStyle="warning">
            <strong>{this.state.error}</strong>
          </div>
          <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="name" type="text" label="Your Name" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="password" type="Password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConfirm" type="Password" label="Password Confirm" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />

            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
              <div>Already have an account? <Link to="/signin">Sign In</Link></div>
            </div>
          </form>
        </div>
      );
    } else {*/
      return (
        <div className="container">
          <div id="space">
          </div>
          <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="userName" type="text" label="Username" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="firstName" type="text" label="First Name" changeCallback={this.handleChange} errors={firstNameErrors} />

            <ValidatedInput field="lastName" type="text" label="Last Name" changeCallback={this.handleChange} errors={lastNameErrors} />

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConf" type="password" label="Password Confirm" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />

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