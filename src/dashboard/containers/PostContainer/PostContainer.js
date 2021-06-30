import React, { Component } from "react";
import { Header, LeftWrapper, RightWrapper, SideBar, DetailPanel } from "../../components";

class PostContainer extends Component {
  constructor(props){
    super(props);
    this.state = {userId: props.location.state}
  }

  render() {
    return (
      <div>
        <div>
          <Header></Header>
        </div>
        <div>
          <LeftWrapper>
            <SideBar userId={this.state}></SideBar>
          </LeftWrapper>
        </div>
        <div>
          <RightWrapper>
            <DetailPanel userId={this.state}></DetailPanel>
          </RightWrapper>
        </div>
      </div>
    );
  }
}

export default PostContainer;
