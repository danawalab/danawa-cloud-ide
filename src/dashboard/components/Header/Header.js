import React, { Component } from 'react';
import './Header.css';
import { Button } from "semantic-ui-react";
import { withRouter } from "react-router-dom";


class Header extends Component {
    clickHandle = () => {
        const { history } = this.props;
        window.localStorage.setItem("user_id", "");
        history.push({
            pathname: "/"
        });
    }

    render() {
        return (
            <div>
                <div className="Header">
                    OJT_IDE.
                    <Button color="black" style={{float:"right"}} onClick={this.clickHandle}>
                        LOGOUT
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Header);