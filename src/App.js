import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { PostContainer } from "./dashboard/containers";
import { nPostContainer } from "./createpage/containers";
import { lPostContainer } from "./loginform/containers";
import { jPostContainer } from "./joinform/containers";
import { notFoundPage } from "./notfound/notFound";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
            <Route path="/" component={lPostContainer} exact></Route>
            <Route path="/join" component={jPostContainer}></Route>
            <Route path="/join?remove=true" component={jPostContainer}></Route>
            <Route path="/main" component={PostContainer}></Route>
            <Route path="/newContainer" component={nPostContainer}></Route>
            <Route component={notFoundPage} exact></Route>
        </Switch>
      </BrowserRouter>
    );
  }
}
export default App;
