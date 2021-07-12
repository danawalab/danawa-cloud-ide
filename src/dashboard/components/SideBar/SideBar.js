import React, { Component } from 'react';
import './SideBar.css';
class SideBar extends Component {
    state = {
        id : this.props.userId.userId
    };
    
    render() {
        return (
            <div className="SideBar">
                <h4>User</h4>
                <h3>{window.localStorage.getItem("user_id")}</h3>
            </div>
        );
    }
}

export default SideBar;