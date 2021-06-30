import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { PostContainer } from "./dashboard/containers";
import { nPostContainer } from "./createpage/containers";
import { lPostContainer } from "./loginform/containers";
import { jPostContainer } from "./joinform/containers";

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <Route path="/" component={lPostContainer} exact></Route>
            <Route path="/join" component={jPostContainer}></Route>
            <Route path="/main" component={PostContainer}></Route>
            <Route path="/newContainer" component={nPostContainer}></Route>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
export default App;
