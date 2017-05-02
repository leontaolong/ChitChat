import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {ValidatedInput, ValidationErrors} from './SignIn';

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
      'name': undefined,
      'passwordConfirm': undefined,
      'visible': false
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
    this.signUpUser(this.state.email, this.state.password, this.state.name);
  }

  //A callback function for registering new users
  signUpUser(email, password, handle) {
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
    var handleErrors = this.validate(this.state.name, { required: true });
    var passwordConfirmationErrors = this.validate(this.state.password, { required: true, toBeMatched: this.state.passwordConfirm })
    //button validation
    var signUpEnabled = (emailErrors.isValid && passwordErrors.isValid && handleErrors.isValid && passwordConfirmationErrors.isValid);
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
              <div>Already have an account? <Link to="/login">Sign In</Link></div>
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
          <Alert bsStyle="warning">
            <strong>{this.state.error}</strong>
          </Alert>
          <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="name" type="text" label="Your Name" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="password" type="Password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConfirm" type="Password" label="Password Confirm" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />

            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
              <div>Already have an account? <Link to="/login">Sign In</Link></div>
            </div>
          </form>
        </div>
      );
    } else {*/
      return (
        <div className="mdl-layout mdl-js-layout mdl-color--grey-100">
            <main className="mdl-layout__content">
              <div className="mdl-card mdl-shadow--6dp">
                <div className="mdl-card__title mdl-color--primary mdl-color-text--white">
                  <h2 className="mdl-card__title-text">Sign In</h2>
                </div>
                <div className="mdl-card__supporting-text">
                  <form action="#">
            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="name" type="text" label="Your Name" changeCallback={this.handleChange} errors={handleErrors} />

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="passwordConfirm" type="password" label="Password Confirm" changeCallback={this.handleChange} errors={passwordConfirmationErrors} />
                  </form>
                </div>
            <div className="mdl-card__actions mdl-card--border">
              <button className="mdl-button mdl-js-button mdl-button--primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button> <br />
              <div className="toSignUpPrompt"> Already have an account? <Link className="toSignUpLink" to="/signin">Sign In</Link> </div>
            </div>

              </div>
            </main>
          </div>
      );
  }
}

export default SignUp;