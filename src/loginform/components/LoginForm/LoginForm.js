import React, { Component } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Icon,
  Message,
  Segment,
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import axios from "axios";

async function compareUserInfo(state) {
  return await axios({
    method: "post",
    url: "/api/login",
    headers: { "Content-Type": "application/json" },
    data: {
      user_id: state.login_id,
      user_pwd: state.login_pwd,
    },
  });
}

class LoginForm extends Component {
  state = {
    login_id: "",
    login_pwd: "",
    login_result: ""
  };
  loginProcess = async () => {
    if(this.state.login_id !== "" && this.state.login_pwd !== ""){
      let msg = ""
      
      try{
        msg = await compareUserInfo(this.state);
      }catch(e){
        console.error(e)
      }

      if(msg.data.container.length == 1){
        const { history } = this.props;
        window.localStorage.setItem("user_id", this.state.login_id);
        history.push({
          pathname: "/main"
        });
      } else {
        this.setState({
          login_result : "아이디, 비밀번호 불일치"
        });
      }
    } else {
      this.setState({
        login_result : "아이디, 비밀번호 미입력"
      });
    }
  };

  changeId = (e) => {
    this.setState({
      login_id : e.target.value,
      login_result : ""
    });
  };

  changePwd = (e) => {
    this.setState({
      login_pwd : e.target.value,
      login_result : ""
    });
  };

  render() {
    return (
      <div>
        <Grid
          textAlign="center"
          style={{ height: "100vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="black" textAlign="center">
              <Icon name="cloud" /> DANAWA CLOUD IDE
            </Header>
            <Form size="large">
              <Segment stacked>
                <Form.Input
                  fluid
                  icon="user"
                  iconPosition="left"
                  onChange={this.changeId}
                  placeholder="아이디"
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="비밀번호"
                  onChange={this.changePwd}
                  type="password"
                />
                <Button
                  color="grey"
                  fluid
                  size="large"
                  onClick={this.loginProcess}
                >
                  로그인
                </Button>
              </Segment>
            </Form>
            <Message>
              <Link to={{ pathname: "/join" }}>
                <h4>회원 신규 등록</h4>
              </Link>
            </Message>
            <Message>
              <Link to={{ pathname: "/join?remove=true" }}>
                <h4>계정 삭제</h4>
              </Link>
            </Message>
            <Message
              style={
                this.state.login_result === ""
                  ? { display: "none" }
                  : { display: "block" }
              }
              negative
            >
              <Message.Header>* 로그인 실패 *</Message.Header>
              <div>
                {this.state.login_result} <div>{this.state.join_failMsg}</div>
              </div>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default withRouter(LoginForm);
