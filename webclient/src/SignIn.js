import React, { Component } from 'react';
import {Link} from 'react-router-dom'

class SignIn extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'email': undefined,
      'password': undefined,
      'visible': false
    };

    //function binding
    this.handleChange = this.handleChange.bind(this);
    this.signInUser = this.signInUser.bind(this);
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
    this.signInUser(this.state.email, this.state.password);
  }

  signInUser(email, password) {
    var thisComponent = this;
    /* Sign in the user */
    thisComponent.setState({
      visible: !this.state.visible
    });
    // firebase.auth().signInWithEmailAndPassword(email, password)
    //   .catch(function (error) {
    //     thisComponent.setState({ error: error.message, visible: !thisComponent.state.visible });
    //   })
    //   .then(function () {
    //     if (firebase.auth().currentUser)
    //       hashHistory.goBack()
    //   });
    // go back to the previous page
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

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button> <br />
              <div className="signInUpLink">Don't have an account? <Link to="/signin">Sign Up</Link> </div>
            </div>
          </form>
        </div>
      )
    };
    //if there are errors then show them in the alert box
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
            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />
            <div className="form-group sign-up-buttons">
              <button className="btn btn-primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button>
              Don't have an account? <Link to="/siginin"><button className="btn btn-primary">Sign Up</button></Link>
            </div>
          </form>
        </div>
      )
    } else {*/
      return (
          <div className="mdl-layout mdl-js-layout mdl-color--grey-100 main">
            <main className="mdl-layout__content">
              <div className="mdl-card mdl-shadow--6dp">
                <div className="mdl-card__title mdl-color--primary mdl-color-text--white">
                  <h2 className="mdl-card__title-text">Sign In</h2>
                </div>
                <div className="mdl-card__supporting-text">
                  <form action="#">
                    <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />
                    <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />
                  </form>
                </div>
                <div className="mdl-card__actions mdl-card--border">
                  <button className="mdl-button mdl-js-button mdl-button--primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button> <br />
                  <div className="toSignUpPrompt">Don't have an account? <Link className="toSignUpLink"to="/signin">Sign Up</Link></div>
                </div>
              </div>
            </main>
          </div>
      );
  }
}
//A component that displays an input form with validation styling
//props are: field, type, label, changeCallback, errors
class ValidatedInput extends React.Component {
  render() {
    return (
      <div className="mdl-textfield mdl-js-textfield">
        <input className="mdl-textfield__input" aria-label="input" id={this.props.field} type={this.props.type} name={this.props.field} onChange={this.props.changeCallback} />
        <label className="mdl-textfield__label" htmlFor={this.props.field}>{this.props.label}</label>
        <ValidationErrors errors={this.props.errors} />
      </div>
    );
  }
}
//a component to represent and display validation errors
class ValidationErrors extends React.Component {
  render() {
    return (
      <div>
        {this.props.errors.required &&
          <p className="mdl-textfield__error" >Required!</p>
        }
        {this.props.errors.email &&
          <p className="mdl-textfield__error">Not an email address!</p>
        }
        {this.props.errors.minLength &&
          <p className="mdl-textfield__error">Must be at least {this.props.errors.minLength}characters.</p>
        }
        {this.props.errors.matches &&
          <p className="mdl-textfield__error">Passwords doesn't match</p>
        }
      </div>
    );
  }
}

export default SignIn;







          /*<div className="mdl-layout mdl-js-layout mdl-color--grey-100 main">
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
          </div>*/