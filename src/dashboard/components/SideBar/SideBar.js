import React, { Component } from 'react';
import './SideBar.css';
class SideBar extends Component {
    state = {
        id : this.props.userId.userId
    };
    
    render() {
                
        return (
            <div className="SideBar">
                <h4>사용자</h4>
                <h3>{this.state.id}</h3>
            </div>
        );
    }
}

export default SideBar;