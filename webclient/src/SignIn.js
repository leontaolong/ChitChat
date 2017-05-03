import React from 'react';
import {Link} from 'react-router-dom'

class SignIn extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      'email': undefined,
      'password': undefined
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
    if (this.state.visible) {
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
              <div className="signInUpLink">Don't have an account? <Link to="/signup">Sign Up</Link> </div>
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
              Don't have an account? <Link to="/signup"><button className="btn btn-primary">Sign Up</button></Link>
            </div>
          </form>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div id="space">
          </div>
          <form role="form" className="sign-up-form">
            <ValidatedInput field="email" type="email" label="Your Email Address" changeCallback={this.handleChange} errors={emailErrors} />

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

