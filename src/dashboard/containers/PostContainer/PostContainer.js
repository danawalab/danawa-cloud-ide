import React, { Component } from "react";
import { Header, LeftWrapper, RightWrapper, SideBar, DetailPanel } from "../../components";

class PostContainer extends Component {
  constructor(props){
    super(props);
    this.state = {userId: props.location.state, arr: ""}
  }

  parentFunction = (text) => {
    this.setState({
      arr : text
    });
  }

  render() {
    return (
      <div>
        <div>
          <Header></Header>
        </div>
        <div>
          <LeftWrapper>
            <SideBar userId={this.state} arr={this.state}></SideBar>
          </LeftWrapper>
        </div>
        <div>
          <RightWrapper>
            <DetailPanel userId={this.state} parentFunction={this.parentFunction}></DetailPanel>
          </RightWrapper>
        </div>
      </div>
    );
  }
}

export default PostContainer;
