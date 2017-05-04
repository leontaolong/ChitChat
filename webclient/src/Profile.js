import React from 'react';
import {Link} from 'react-router-dom'

class Profile extends React.Component {
  
  render() {
    return (
      <div className="info">
        <img src={this.props.img} alt={this.props.name} />
        <div id="prof_name">{this.props.name}</div>
        <div>{this.props.desc}</div>
      </div>
    );
  }
}

export default Profile;